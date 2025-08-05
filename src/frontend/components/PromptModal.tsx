import React from 'react';
import { X, Copy, CheckCircle, User, Calendar, Weight, Target, Heart, Trophy, Utensils, Shield, TrendingUp, Zap } from 'lucide-react';
import { StravaActivity } from '../../types/strava.ts';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: StravaActivity[];
  athlete: any;
}

type PromptCategory = 'general' | 'performance' | 'nutrition' | 'race_prep' | 'injury_prevention' | 'weight_management' | 'endurance' | 'strength';

const PROMPT_CATEGORIES = {
  general: {
    icon: User,
    title: 'General Analysis',
    description: 'Comprehensive overview of your training patterns and overall fitness',
    color: 'from-blue-500 to-purple-500'
  },
  performance: {
    icon: TrendingUp,
    title: 'Performance Optimization',
    description: 'Analyze trends, identify improvements, and optimize training efficiency',
    color: 'from-green-500 to-teal-500'
  },
  nutrition: {
    icon: Utensils,
    title: 'Nutrition & Fueling',
    description: 'Dietary recommendations based on your training load and goals',
    color: 'from-orange-500 to-red-500'
  },
  race_prep: {
    icon: Trophy,
    title: 'Race Preparation',
    description: 'Training plans and strategies for upcoming races or events',
    color: 'from-yellow-500 to-orange-500'
  },
  injury_prevention: {
    icon: Shield,
    title: 'Injury Prevention',
    description: 'Identify risk factors and get recovery/prevention strategies',
    color: 'from-red-500 to-pink-500'
  },
  weight_management: {
    icon: Target,
    title: 'Weight Management',
    description: 'Exercise and lifestyle recommendations for weight goals',
    color: 'from-purple-500 to-indigo-500'
  },
  endurance: {
    icon: Heart,
    title: 'Endurance Building',
    description: 'Strategies to improve cardiovascular fitness and stamina',
    color: 'from-cyan-500 to-blue-500'
  },
  strength: {
    icon: Zap,
    title: 'Strength & Power',
    description: 'Build strength, power, and complement your cardio training',
    color: 'from-indigo-500 to-purple-500'
  }
};

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, activities, athlete }) => {
  const [copied, setCopied] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<PromptCategory>('general');
  const [userInputs, setUserInputs] = React.useState({
    dateOfBirth: '',
    weight: '',
    goals: '',
    injuryHistory: '',
    experience: '',
    raceGoal: '',
    currentWeight: '',
    targetWeight: '',
    dietaryRestrictions: ''
  });

  if (!isOpen) return null;

  const getBaseAthleteInfo = () => {
    return {
      name: `${athlete.firstname} ${athlete.lastname}`,
      location: `${athlete.city}, ${athlete.state}, ${athlete.country}`,
      sex: athlete.sex,
      strava_since: athlete.created_at.split('T')[0],
      premium_member: athlete.premium,
      date_of_birth: userInputs.dateOfBirth || '[PLEASE FILL IN YOUR DATE OF BIRTH]',
      weight_kg: userInputs.weight || athlete.weight || '[PLEASE FILL IN YOUR WEIGHT IN KG]',
      training_experience: userInputs.experience || '[PLEASE DESCRIBE YOUR TRAINING EXPERIENCE LEVEL]'
    };
  };

  const generatePrompt = () => {
    const athleteInfo = getBaseAthleteInfo();
    const basePrompt = `I am an athlete seeking specialized analysis of my workout data. Please analyze my training data and provide insights focused on ${PROMPT_CATEGORIES[selectedCategory].title.toLowerCase()}.

## Athlete Profile
- Name: ${athleteInfo.name}
- Location: ${athleteInfo.location}
- Gender: ${athleteInfo.sex === 'M' ? 'Male' : 'Female'}
- Date of Birth: ${athleteInfo.date_of_birth}
- Weight: ${athleteInfo.weight_kg}
- Strava Member Since: ${athleteInfo.strava_since}
- Premium Member: ${athleteInfo.premium_member}
- Training Experience: ${athleteInfo.training_experience}`;

    const categorySpecificSections = {
      general: `
- Fitness Goals: ${userInputs.goals || '[PLEASE DESCRIBE YOUR FITNESS GOALS]'}
- Injury History: ${userInputs.injuryHistory || '[PLEASE DESCRIBE ANY INJURY HISTORY OR "NONE"]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Analysis Request
Please provide a comprehensive analysis including:
1. **Training Volume Analysis**: Weekly/monthly patterns, trends over time
2. **Performance Trends**: Speed, endurance, consistency improvements or declines
3. **Activity Distribution**: Balance between different workout types
4. **Recovery Patterns**: Rest days, intensity distribution
5. **Personalized Recommendations**: Based on my profile and goals
6. **Areas for Improvement**: Specific actionable advice
7. **Goal-Specific Guidance**: Tailored to my stated fitness objectives`,

      performance: `
- Current Fitness Goals: ${userInputs.goals || '[DESCRIBE YOUR PERFORMANCE GOALS]'}
- Areas of Focus: ${userInputs.injuryHistory || '[WHAT ASPECTS OF PERFORMANCE DO YOU WANT TO IMPROVE?]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Performance Analysis Request
Please provide detailed analysis focusing on:
1. **Performance Metrics Trends**: Speed, power, heart rate, pace improvements
2. **Training Load Analysis**: Volume vs intensity balance, periodization
3. **Efficiency Metrics**: Running economy, cycling power efficiency, swimming stroke rate
4. **Peak Performance Identification**: Best performances and what led to them
5. **Plateau Analysis**: Identify performance plateaus and breakthrough strategies
6. **Training Zones**: Current fitness zones and optimization recommendations
7. **Comparative Analysis**: Performance relative to age group and experience level
8. **Specific Improvements**: Concrete steps to achieve next performance level`,

      nutrition: `
- Current Weight: ${userInputs.currentWeight || userInputs.weight || '[CURRENT WEIGHT IN KG]'}
- Dietary Restrictions: ${userInputs.dietaryRestrictions || '[ANY DIETARY RESTRICTIONS OR PREFERENCES]'}
- Fitness Goals: ${userInputs.goals || '[YOUR FITNESS AND BODY COMPOSITION GOALS]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Nutrition Analysis Request
Please provide nutrition guidance based on my training data:
1. **Caloric Needs**: Daily calorie requirements based on training volume
2. **Macronutrient Distribution**: Protein, carbs, fats for my training style
3. **Pre-Workout Nutrition**: Fueling strategies for different workout types
4. **Post-Workout Recovery**: Optimal nutrition for recovery and adaptation
5. **Race Day Fueling**: Nutrition strategy for long events (if applicable)
6. **Hydration Guidelines**: Fluid needs based on training intensity and duration
7. **Supplement Recommendations**: Evidence-based supplements for my goals
8. **Meal Timing**: When to eat around training sessions
9. **Body Composition**: Nutrition strategies for body composition goals`,

      race_prep: `
- Target Race/Event: ${userInputs.raceGoal || '[DESCRIBE YOUR TARGET RACE OR EVENT]'}
- Current Fitness Goals: ${userInputs.goals || '[YOUR RACE-SPECIFIC GOALS AND TARGETS]'}
- Experience Level: ${userInputs.experience || '[YOUR RACING EXPERIENCE]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Race Preparation Analysis
Please provide a race-focused training analysis:
1. **Current Fitness Assessment**: Readiness for target event based on recent training
2. **Training Periodization**: How to structure training leading up to race
3. **Workout Specificity**: Race-specific sessions to include in training
4. **Taper Strategy**: How to reduce volume while maintaining fitness
5. **Race Pacing Strategy**: Optimal pacing based on current fitness
6. **Weakness Identification**: Areas that need focus before race day
7. **Race Day Preparation**: Logistics, nutrition, and mental preparation
8. **Goal Setting**: Realistic time goals based on current fitness
9. **Backup Plans**: Alternative strategies if conditions change`,

      injury_prevention: `
- Injury History: ${userInputs.injuryHistory || '[DESCRIBE ANY PAST INJURIES OR CURRENT CONCERNS]'}
- Current Issues: ${userInputs.goals || '[ANY CURRENT ACHES, PAINS, OR CONCERNS]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Injury Prevention Analysis
Please provide injury prevention guidance:
1. **Risk Factor Analysis**: Based on training patterns and history
2. **Training Load Assessment**: Volume increases and recovery adequacy
3. **Movement Pattern Analysis**: Common issues for my sport/activity mix
4. **Recovery Evaluation**: Rest days, sleep, and recovery practices
5. **Strength Training**: Specific exercises to prevent common injuries
6. **Flexibility & Mobility**: Stretching and mobility work recommendations
7. **Load Management**: How to safely progress training volume/intensity
8. **Warning Signs**: What to watch for to prevent injury escalation
9. **Cross-Training**: Low-impact alternatives for recovery days`,

      weight_management: `
- Current Weight: ${userInputs.currentWeight || userInputs.weight || '[CURRENT WEIGHT IN KG]'}
- Target Weight: ${userInputs.targetWeight || '[TARGET WEIGHT IN KG]'}
- Goals: ${userInputs.goals || '[WEIGHT AND BODY COMPOSITION GOALS]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Weight Management Analysis
Please provide weight management guidance:
1. **Calorie Burn Analysis**: Average calories burned through exercise
2. **Exercise Efficiency**: Best activities for weight management goals
3. **Training Recommendations**: Optimal mix of cardio and strength training
4. **Metabolic Impact**: How current training affects metabolism
5. **Sustainable Approach**: Long-term strategies that work with lifestyle
6. **Progress Tracking**: Metrics beyond the scale to monitor success
7. **Plateau Solutions**: Strategies when weight loss stalls
8. **Muscle Preservation**: Maintaining lean mass during weight loss
9. **Integration Tips**: Combining nutrition and exercise for best results`,

      endurance: `
- Endurance Goals: ${userInputs.goals || '[DESCRIBE YOUR ENDURANCE GOALS - DISTANCE, TIME, ETC.]'}
- Current Limitations: ${userInputs.injuryHistory || '[WHAT CURRENTLY LIMITS YOUR ENDURANCE?]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Endurance Building Analysis
Please provide endurance-focused guidance:
1. **Aerobic Base Assessment**: Current cardiovascular fitness level
2. **Progressive Overload**: How to safely increase endurance capacity
3. **Training Zones**: Heart rate zones for optimal endurance development
4. **Long Session Strategy**: Building tolerance for longer efforts
5. **Recovery Optimization**: Balancing stress and adaptation for endurance gains
6. **Fuel Utilization**: Improving fat burning efficiency for endurance
7. **Mental Endurance**: Psychological strategies for longer efforts
8. **Periodization**: Structuring endurance training over time
9. **Cross-Training**: Activities that complement endurance development`,

      strength: `
- Strength Goals: ${userInputs.goals || '[DESCRIBE YOUR STRENGTH AND POWER GOALS]'}
- Current Training: ${userInputs.injuryHistory || '[CURRENT STRENGTH TRAINING IF ANY]'}

## Workout Data (${activities.length} activities)
[PLEASE ATTACH YOUR EXPORTED WORKOUT FILE HERE]

## Strength & Power Analysis
Please provide strength training guidance:
1. **Current Strength Assessment**: Based on power data and performance
2. **Cardio-Strength Integration**: Balancing endurance and strength training
3. **Sport-Specific Strength**: Exercises that directly improve performance
4. **Power Development**: Training explosive power for my activities
5. **Injury Prevention**: Strength exercises to address common weaknesses
6. **Periodization**: How to cycle strength work with cardio training
7. **Recovery Management**: Balancing strength and endurance recovery
8. **Progressive Loading**: How to safely increase strength training load
9. **Equipment Needs**: Minimal equipment solutions for strength training`
    };

    return basePrompt + (categorySpecificSections[selectedCategory] || categorySpecificSections.general) + `

Please consider my age, experience level, and stated goals in your analysis. Provide specific, actionable recommendations that I can implement in my training routine.`;
  };

  const prompt = generatePrompt();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getCategoryInputs = () => {
    switch (selectedCategory) {
      case 'nutrition':
      case 'weight_management':
        return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Weight (kg)
                </label>
                <input
                    type="number"
                    value={userInputs.currentWeight}
                    onChange={(e) => setUserInputs({...userInputs, currentWeight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 70"
                />
              </div>

              {selectedCategory === 'weight_management' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Weight (kg)
                    </label>
                    <input
                        type="number"
                        value={userInputs.targetWeight}
                        onChange={(e) => setUserInputs({...userInputs, targetWeight: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., 65"
                    />
                  </div>
              )}

              {selectedCategory === 'nutrition' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions
                    </label>
                    <input
                        type="text"
                        value={userInputs.dietaryRestrictions}
                        onChange={(e) => setUserInputs({...userInputs, dietaryRestrictions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Vegetarian, gluten-free, or 'None'"
                    />
                  </div>
              )}
            </>
        );

      case 'race_prep':
        return (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Race/Event
              </label>
              <input
                  type="text"
                  value={userInputs.raceGoal}
                  onChange={(e) => setUserInputs({...userInputs, raceGoal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Half Marathon in 3 months, Century ride, Olympic triathlon"
              />
            </div>
        );

      case 'injury_prevention':
        return (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Injury History & Current Concerns
              </label>
              <textarea
                  value={userInputs.injuryHistory}
                  onChange={(e) => setUserInputs({...userInputs, injuryHistory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Previous knee injury in 2022, current lower back tightness, or 'None'"
              />
            </div>
        );

      default:
        return null;
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">AI Analysis Prompt</h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
            {/* Category Selection */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Analysis Focus</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === key;

                  return (
                      <button
                          key={key}
                          onClick={() => setSelectedCategory(key as PromptCategory)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">
                              {category.title}
                            </h5>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </button>
                  );
                })}
              </div>
            </div>

            {/* User Inputs */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Profile</h4>
              <p className="text-gray-600 mb-4">
                Fill in information to get more personalized AI analysis for {PROMPT_CATEGORIES[selectedCategory].title.toLowerCase()}:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Common fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Birth
                  </label>
                  <input
                      type="date"
                      value={userInputs.dateOfBirth}
                      onChange={(e) => setUserInputs({...userInputs, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Weight className="w-4 h-4 inline mr-1" />
                    Weight (kg)
                  </label>
                  <input
                      type="number"
                      value={userInputs.weight}
                      onChange={(e) => setUserInputs({...userInputs, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 70"
                  />
                </div>

                {/* Category-specific fields */}
                {getCategoryInputs()}

                <div className={selectedCategory === 'race_prep' || selectedCategory === 'injury_prevention' ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedCategory === 'race_prep' ? 'Race Goals' :
                        selectedCategory === 'nutrition' ? 'Nutrition Goals' :
                            selectedCategory === 'weight_management' ? 'Weight Goals' :
                                selectedCategory === 'endurance' ? 'Endurance Goals' :
                                    selectedCategory === 'strength' ? 'Strength Goals' :
                                        selectedCategory === 'performance' ? 'Performance Goals' :
                                            'Fitness Goals'}
                  </label>
                  <textarea
                      value={userInputs.goals}
                      onChange={(e) => setUserInputs({...userInputs, goals: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder={
                        selectedCategory === 'race_prep' ? 'e.g., Complete my first marathon in under 4 hours, improve 5K time' :
                            selectedCategory === 'nutrition' ? 'e.g., Optimize nutrition for endurance, lose body fat while maintaining performance' :
                                selectedCategory === 'weight_management' ? 'e.g., Lose 5kg while maintaining fitness, build lean muscle' :
                                    selectedCategory === 'endurance' ? 'e.g., Run a half marathon, improve cycling endurance for longer rides' :
                                        selectedCategory === 'strength' ? 'e.g., Build functional strength, improve power for cycling' :
                                            selectedCategory === 'performance' ? 'e.g., Improve 10K time, increase cycling power output' :
                                                'e.g., Improve overall fitness, train for upcoming event, build consistency'
                      }
                  />
                </div>

                <div className={selectedCategory === 'race_prep' || selectedCategory === 'injury_prevention' ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Experience Level
                  </label>
                  <select
                      value={userInputs.experience}
                      onChange={(e) => setUserInputs({...userInputs, experience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="Beginner (0-1 years)">Beginner (0-1 years)</option>
                    <option value="Intermediate (1-3 years)">Intermediate (1-3 years)</option>
                    <option value="Advanced (3-5 years)">Advanced (3-5 years)</option>
                    <option value="Expert (5+ years)">Expert (5+ years)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Prompt Display */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Generated AI Prompt</h4>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                  ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Prompt</span>
                      </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt}
              </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2">How to use this prompt:</h5>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the generated prompt above</li>
                <li>Export your Strava data (Activities → Export) or gather your workout files</li>
                <li>Paste the prompt into your preferred AI assistant (ChatGPT, Claude, etc.)</li>
                <li>Attach your workout data file when prompted</li>
                <li>Get personalized training analysis and recommendations!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
  );
};

// Demo component to show the modal in action
export default function StravaPromptDemo() {
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Strava AI Analysis Prompt Generator</h1>
          <p className="text-gray-600 mb-8">Generate personalized AI prompts based on your Strava data</p>

          <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Open Prompt Generator
          </button>
        </div>

        <PromptModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            activities={activities}
            athlete={athlete}
        />
      </div>
  );
}