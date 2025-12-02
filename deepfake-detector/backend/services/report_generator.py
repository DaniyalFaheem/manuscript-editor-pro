"""
Report Generator Service
Creates detailed PDF and JSON reports from analysis results.
"""

import io
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image as RLImage,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class ReportGenerator:
    """Service for generating analysis reports."""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubSection',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceBefore=10,
            spaceAfter=5,
        ))
    
    def generate_pdf_report(
        self,
        analysis_id: str,
        result: Dict[str, Any],
        include_heatmap: bool = True,
        heatmap_data: Optional[bytes] = None,
    ) -> bytes:
        """
        Generate a PDF report from analysis results.
        
        Args:
            analysis_id: Analysis identifier
            result: Analysis result dictionary
            include_heatmap: Whether to include heatmap image
            heatmap_data: Heatmap image bytes
            
        Returns:
            PDF file as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        
        story = []
        
        # Title
        story.append(Paragraph(
            "Deepfake Detection Report",
            self.styles['CustomTitle']
        ))
        
        # Metadata
        story.append(Paragraph(
            f"Analysis ID: {analysis_id}",
            self.styles['Normal']
        ))
        story.append(Paragraph(
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            self.styles['Normal']
        ))
        story.append(Spacer(1, 20))
        
        # Summary Section
        story.append(Paragraph("Summary", self.styles['SectionHeader']))
        
        is_deepfake = result.get("is_deepfake", False)
        confidence = result.get("confidence", 0)
        
        # Create summary table
        summary_data = [
            ["Classification", "FAKE" if is_deepfake else "REAL"],
            ["Confidence Score", f"{confidence * 100:.1f}%"],
            ["Status", "High Risk" if is_deepfake and confidence > 0.8 else 
                      "Medium Risk" if is_deepfake else "Low Risk"],
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Model Results Section
        story.append(Paragraph("Model Analysis", self.styles['SectionHeader']))
        
        model_results = result.get("models", result.get("model_results", {}))
        if model_results:
            model_data = [["Model", "Score", "Prediction"]]
            for model_name, model_result in model_results.items():
                if isinstance(model_result, dict):
                    score = model_result.get("score", model_result.get("confidence", 0))
                    pred = model_result.get("prediction", 
                           "FAKE" if model_result.get("is_fake", False) else "REAL")
                else:
                    score = model_result
                    pred = "FAKE" if score > 0.5 else "REAL"
                
                model_data.append([
                    model_name.title(),
                    f"{score * 100:.1f}%",
                    pred
                ])
            
            model_table = Table(model_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
            model_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a90d9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ]))
            story.append(model_table)
        
        story.append(Spacer(1, 20))
        
        # Detailed Analysis Section
        story.append(Paragraph("Detailed Analysis", self.styles['SectionHeader']))
        
        analysis = result.get("analysis", {})
        
        # Facial Landmarks
        if analysis.get("facial_landmarks"):
            story.append(Paragraph("Facial Landmark Analysis", self.styles['SubSection']))
            fl = analysis["facial_landmarks"]
            story.append(Paragraph(
                f"• Anomaly Detected: {'Yes' if fl.get('anomaly_detected') else 'No'}",
                self.styles['Normal']
            ))
            story.append(Paragraph(
                f"• Landmarks Found: {fl.get('landmark_count', 'N/A')}",
                self.styles['Normal']
            ))
            story.append(Paragraph(
                f"• Symmetry Score: {fl.get('symmetry_score', 0) * 100:.1f}%",
                self.styles['Normal']
            ))
        
        # Texture Analysis
        if analysis.get("texture_analysis"):
            story.append(Paragraph("Texture Analysis", self.styles['SubSection']))
            ta = analysis["texture_analysis"]
            story.append(Paragraph(
                f"• Skin Texture Score: {ta.get('skin_texture_score', 0) * 100:.1f}%",
                self.styles['Normal']
            ))
            story.append(Paragraph(
                f"• Lighting Consistency: {ta.get('lighting_consistency', 0) * 100:.1f}%",
                self.styles['Normal']
            ))
        
        # Metadata
        if analysis.get("metadata"):
            story.append(Paragraph("Metadata Analysis", self.styles['SubSection']))
            md = analysis["metadata"]
            if md.get("software"):
                story.append(Paragraph(
                    f"• Editing Software: {md['software']}",
                    self.styles['Normal']
                ))
            if md.get("camera_model"):
                story.append(Paragraph(
                    f"• Camera: {md.get('camera_make', '')} {md['camera_model']}",
                    self.styles['Normal']
                ))
            if md.get("warnings"):
                for warning in md["warnings"]:
                    story.append(Paragraph(
                        f"⚠️ {warning}",
                        self.styles['Normal']
                    ))
        
        story.append(Spacer(1, 30))
        
        # Disclaimer
        story.append(Paragraph("Disclaimer", self.styles['SectionHeader']))
        story.append(Paragraph(
            "This analysis is provided for informational purposes only. While our "
            "detection models achieve high accuracy rates, no automated system is "
            "100% accurate. Results should be verified by qualified professionals "
            "for high-stakes decisions.",
            self.styles['Normal']
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.read()
    
    def generate_json_report(
        self,
        analysis_id: str,
        result: Dict[str, Any],
    ) -> str:
        """
        Generate a JSON report from analysis results.
        
        Args:
            analysis_id: Analysis identifier
            result: Analysis result dictionary
            
        Returns:
            JSON string
        """
        report = {
            "report_metadata": {
                "analysis_id": analysis_id,
                "generated_at": datetime.utcnow().isoformat(),
                "version": "1.0.0",
            },
            "summary": {
                "is_deepfake": result.get("is_deepfake", False),
                "confidence": result.get("confidence", 0),
                "risk_level": self._calculate_risk_level(
                    result.get("is_deepfake", False),
                    result.get("confidence", 0)
                ),
            },
            "model_results": result.get("models", result.get("model_results", {})),
            "detailed_analysis": result.get("analysis", {}),
            "recommendations": self._generate_recommendations(result),
        }
        
        return json.dumps(report, indent=2, default=str)
    
    def _calculate_risk_level(
        self,
        is_deepfake: bool,
        confidence: float,
    ) -> str:
        """Calculate risk level from results."""
        if not is_deepfake:
            return "low"
        elif confidence > 0.9:
            return "critical"
        elif confidence > 0.7:
            return "high"
        else:
            return "medium"
    
    def _generate_recommendations(
        self,
        result: Dict[str, Any],
    ) -> List[str]:
        """Generate recommendations based on analysis results."""
        recommendations = []
        
        is_deepfake = result.get("is_deepfake", False)
        confidence = result.get("confidence", 0)
        
        if is_deepfake:
            recommendations.append(
                "This content shows signs of manipulation. Exercise caution."
            )
            
            if confidence > 0.9:
                recommendations.append(
                    "High confidence detection. Do not share this content as authentic."
                )
            
            recommendations.append(
                "Consider verifying the source and context of this media."
            )
            recommendations.append(
                "Look for the original, unmanipulated version if possible."
            )
        else:
            recommendations.append(
                "No manipulation detected. However, always verify important media."
            )
            
            if confidence < 0.3:
                recommendations.append(
                    "Very low manipulation score. Content appears authentic."
                )
        
        return recommendations


# Create global instance
report_generator = ReportGenerator()
