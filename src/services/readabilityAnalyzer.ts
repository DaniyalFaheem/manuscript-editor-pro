class ReadabilityAnalyzer {
    static calculateFleschReadingEase(text: string): number {
        const words = text.split(' ').length;
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        const syllables = text.split(/\s+/).reduce((total, word) => total + this.countSyllables(word), 0);
        
        return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    }

    static calculateFleschKincaidGradeLevel(text: string): number {
        const words = text.split(' ').length;
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        const syllables = text.split(/\s+/).reduce((total, word) => total + this.countSyllables(word), 0);
        
        return (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
    }

    static calculateGunningFogIndex(text: string): number {
        const words = text.split(' ').length;
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        const complexWords = text.split(' ').filter(word => this.countSyllables(word) >= 3).length;
        
        return 0.4 * ((words / sentences) + (100 * (complexWords / words)));
    }

    static calculateSMOGIndex(text: string): number {
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        const polysyllables = text.split(/\s+/).filter(word => this.countSyllables(word) >= 3).length;

        return 1.043 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291;
    }

    static calculateAutomatedReadabilityIndex(text: string): number {
        const words = text.split(' ').length;
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        const characters = text.replace(/\s+/g, '').length;
        
        return (4.71 * (characters / words)) + (0.5 * (words / sentences)) - 21.43;
    }

    static calculateColemanLiauIndex(text: string): number {
        const letters = text.replace(/\s+/g, '').length;
        const words = text.split(' ').length;
        const sentences = text.match(/[.!?]+/g)?.length || 0;
        
        const L = (letters / words) * 100;
        const S = (sentences / words) * 100;
        
        return 0.0588 * L - 0.296 * S - 15.8;
    }

    private static countSyllables(word: string): number {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        return word.match(/[aeiouy]+/g)?.length || 0;
    }
}

export default ReadabilityAnalyzer;