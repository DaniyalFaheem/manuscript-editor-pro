/**
 * Basic Usage Example
 * 
 * Demonstrates how to use the core analysis pipeline
 */

import { preprocessor, ruleEngine, reranker } from '../src/core';
import { styleAnalyzer, consistencyChecker } from '../src/features';

/**
 * Example: Analyze text and get suggestions
 */
async function analyzeText(text: string) {
  console.log('=== Manuscript Editor Pro - Example Usage ===\n');
  console.log('Input text:');
  console.log(text);
  console.log('\n--- Processing ---\n');

  // Step 1: Preprocess text
  console.log('1. Preprocessing...');
  const context = preprocessor.process(text);
  console.log(`   - Found ${context.sentences.length} sentences`);
  console.log(`   - Found ${context.tokens.filter(t => t.type === 'word').length} words`);
  console.log(`   - Found ${context.paragraphs.length} paragraphs`);

  // Step 2: Apply grammar rules
  console.log('\n2. Running rule engine...');
  const ruleSuggestions = ruleEngine.check(context);
  console.log(`   - Found ${ruleSuggestions.length} rule-based suggestions`);

  // Step 3: Analyze style
  console.log('\n3. Analyzing style...');
  const { metrics, suggestions: styleSuggestions } = styleAnalyzer.analyze(context);
  console.log(`   - Flesch Reading Ease: ${metrics.fleschReadingEase} (${styleAnalyzer.interpretReadability(metrics.fleschReadingEase)})`);
  console.log(`   - Flesch-Kincaid Grade: ${metrics.fleschKincaidGrade}`);
  console.log(`   - Passive Voice: ${metrics.passiveVoicePercentage}%`);
  console.log(`   - Found ${styleSuggestions.length} style suggestions`);

  // Step 4: Check consistency
  console.log('\n4. Checking consistency...');
  const { suggestions: consistencySuggestions } = consistencyChecker.check(context);
  console.log(`   - Found ${consistencySuggestions.length} consistency issues`);

  // Step 5: Combine and rerank suggestions
  console.log('\n5. Reranking suggestions...');
  const allSuggestions = [
    ...ruleSuggestions,
    ...styleSuggestions,
    ...consistencySuggestions,
  ];
  
  const rankedSuggestions = reranker.rerank(allSuggestions, {
    minConfidence: 0.5,
    maxSuggestions: 10,
    deduplicateOverlaps: true,
  });
  
  console.log(`   - ${allSuggestions.length} total suggestions`);
  console.log(`   - ${rankedSuggestions.length} after filtering and ranking`);

  // Step 6: Display top suggestions
  console.log('\n--- Top Suggestions ---\n');
  
  if (rankedSuggestions.length === 0) {
    console.log('✅ No issues found! Your writing looks great!');
  } else {
    rankedSuggestions.slice(0, 5).forEach((suggestion, index) => {
      console.log(`${index + 1}. [${suggestion.category.toUpperCase()}] ${suggestion.message}`);
      console.log(`   Original: "${suggestion.original}"`);
      if (Array.isArray(suggestion.replacement)) {
        console.log(`   Suggested: ${suggestion.replacement.map(r => `"${r}"`).join(' or ')}`);
      } else {
        console.log(`   Suggested: "${suggestion.replacement}"`);
      }
      console.log(`   Confidence: ${Math.round(suggestion.confidence * 100)}%`);
      console.log(`   Explanation: ${suggestion.explanation.split('\n')[0]}`);
      console.log('');
    });
  }

  // Step 7: Get statistics
  const stats = reranker.getStatistics(rankedSuggestions);
  console.log('--- Statistics ---');
  console.log(`Total suggestions: ${stats.total}`);
  console.log(`By category:`, stats.byCategory);
  console.log(`By severity:`, stats.bySeverity);
  console.log(`Average confidence: ${Math.round(stats.averageConfidence * 100)}%`);
  
  return {
    context,
    suggestions: rankedSuggestions,
    metrics,
    stats,
  };
}

/**
 * Example texts to analyze
 */
const examples = {
  // Example with common errors
  withErrors: `The dogs is barking loudly. I could of went to the store yesterday, but I didnt have time. Its a beautiful day outside, and their going to the park. This sentence have a error in it. I recieved your email about the meeting.`,

  // Example with style issues
  withStyleIssues: `The report was written by the team. The analysis was conducted by the researchers. The data was collected by the students. The results were presented by the professor. Very good work was done by everyone involved.`,

  // Example with consistency issues
  withConsistency: `The Internet is very important. We use email daily. The internet has changed everything. Send me an e-mail when you're ready. Our company's website is online now. The web site will be updated soon.`,

  // Clean example
  clean: `The research demonstrates clear findings. Scientists conducted thorough experiments. Results show significant improvements. The team presents compelling evidence.`,
};

/**
 * Run examples
 */
async function runExamples() {
  console.log('\n'.repeat(2));
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Manuscript Editor Pro - Core Pipeline Examples          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Example 1: Text with errors
  console.log('📝 EXAMPLE 1: Text with Common Errors');
  console.log('─'.repeat(60));
  await analyzeText(examples.withErrors);
  
  console.log('\n\n');

  // Example 2: Text with style issues
  console.log('📝 EXAMPLE 2: Text with Style Issues');
  console.log('─'.repeat(60));
  await analyzeText(examples.withStyleIssues);
  
  console.log('\n\n');

  // Example 3: Text with consistency issues
  console.log('📝 EXAMPLE 3: Text with Consistency Issues');
  console.log('─'.repeat(60));
  await analyzeText(examples.withConsistency);
  
  console.log('\n\n');

  // Example 4: Clean text
  console.log('📝 EXAMPLE 4: Clean Text');
  console.log('─'.repeat(60));
  await analyzeText(examples.clean);

  console.log('\n'.repeat(2));
  console.log('✨ All examples completed!');
  console.log('\nNext steps:');
  console.log('  - Integrate with UI components');
  console.log('  - Add ML models for context-aware suggestions');
  console.log('  - Implement browser extension');
  console.log('  - Add multi-language support');
}

// Run if executed directly
if (typeof window === 'undefined') {
  runExamples().catch(console.error);
}

export { analyzeText, runExamples, examples };
