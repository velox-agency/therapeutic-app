-- Sample Resources Seed Data
-- Run this after the initial schema migration

INSERT INTO resources (title, content, type, category) VALUES
(
  'Understanding Communication Stages',
  'Communication development in autistic children often follows a unique path. Here are key strategies to support each stage:

**Pre-verbal Stage:**
- Use picture cards (PECS) to introduce communication concepts
- Pair words with gestures consistently
- Celebrate all communication attempts, not just words

**Emerging Words Stage:**
- Create communication opportunities throughout the day
- Use "choice boards" for meals and activities
- Model short phrases: "Want milk" instead of "Do you want some milk?"

**Phrase Building Stage:**
- Expand on your child''s utterances: Child says "car go" → You say "The car is going fast!"
- Use visual schedules to introduce sequencing words (first, then, next)
- Practice social phrases in low-pressure situations

**Conversation Stage:**
- Use social stories to practice back-and-forth dialogue
- Create scripts for common social situations
- Practice "wh" questions during preferred activities

Remember: Every child''s timeline is different. Focus on progress, not perfection.',
  'article',
  'Communication'
),
(
  'Meltdown Prevention: Early Warning Signs',
  'Recognizing early signs of overwhelm can help prevent meltdowns before they escalate.

**Physical Signs to Watch:**
- Increased stimming (rocking, hand flapping, pacing)
- Changes in breathing patterns
- Covering ears or eyes
- Skin flushing or sweating
- Muscle tension

**Behavioral Signs:**
- Requesting the same thing repeatedly
- Difficulty making eye contact
- Decreased verbal responses
- Seeking isolation
- Increased rigidity about routines

**Environmental Triggers:**
- Sensory overload (noise, lights, crowds)
- Unexpected schedule changes
- Hunger or fatigue
- Social demands
- Transition difficulties

**Proactive Strategies:**
1. Create a "calm down kit" with sensory tools
2. Use visual timers for transitions
3. Offer choices to restore sense of control
4. Have a designated quiet space available
5. Practice calming strategies when your child is already calm

**In the Moment:**
- Reduce sensory input immediately
- Speak in calm, short sentences
- Avoid asking questions
- Provide physical space
- Wait until calm to discuss what happened',
  'article',
  'Meltdowns'
),
(
  'Sensory Diet: Daily Activities Guide',
  'A sensory diet is a personalized set of activities that provide the sensory input your child needs throughout the day.

**Morning Routine (Alerting Activities):**
- Jumping on a mini trampoline (5-10 jumps)
- Crunchy breakfast foods
- Cool water splash on face
- Upbeat music during getting dressed

**School Preparation (Organizing Activities):**
- Deep pressure hugs
- Heavy backpack carry
- Chewy snack before bus/car
- Fidget tool in pocket

**After School (Calming Activities):**
- Quiet time in dim lighting
- Weighted blanket rest
- Slow, rhythmic swinging
- Drink through a straw

**Evening Routine (Regulating Activities):**
- Warm bath with lavender
- Slow, deep pressure massage
- White noise or soft music
- Heavy blanket for sleep

**Signs Your Child Needs Sensory Input:**
- Seeking: Crashing, spinning, mouthing objects
- Avoiding: Covering ears, avoiding touch, food aversions

Work with your OT to customize this diet for your child''s specific needs.',
  'exercise',
  'Sensory'
),
(
  'Social Skills: The "Social Detective" Game',
  'Turn social learning into a fun detective game your child will love!

**How to Play:**

**Level 1: Body Language Detective 🔍**
Look at pictures or people and guess:
- Are they happy, sad, or angry?
- Do they want to talk or be alone?
- Are they interested or bored?

Clues to look for: eyebrows, mouth shape, body posture, where they''re looking

**Level 2: Voice Detective 🎤**
Listen and identify:
- Is the voice loud or quiet?
- Is it fast or slow?
- What feeling does the voice tell you?

Practice with TV on mute, then with sound to check answers!

**Level 3: Situation Detective 📋**
Look at the whole picture:
- What is happening?
- What might happen next?
- What would be a "expected" thing to say or do?

**Detective Tools:**
- Use thought bubbles to guess what people are thinking
- Create "case files" with photos and clues
- Award detective badges for good observations

**Home Practice:**
- During family movies, pause and ask: "What are they feeling?"
- At the grocery store: "Does that person need help?"
- During playdates: "What does your friend want to play?"

Remember: Being a good social detective takes practice. Celebrate every observation!',
  'exercise',
  'Social Skills'
),
(
  'Visual Schedule Template for Daily Routines',
  'Visual schedules reduce anxiety by making routines predictable. Here''s how to create and use them effectively.

**Creating Your Schedule:**

1. **Choose your format:**
   - Vertical strip (top to bottom)
   - Horizontal strip (left to right)
   - Flip book style
   - Digital app on tablet

2. **Select visual supports:**
   - Real photos (most concrete)
   - Colored pictures/icons
   - Line drawings
   - Written words (most abstract)

3. **Keep it simple:**
   - Start with 3-5 activities
   - Expand as your child masters it
   - Include only essential steps

**Sample Morning Schedule:**

☐ 🛏️ Wake up
☐ 🚽 Bathroom
☐ 👕 Get dressed
☐ 🥣 Eat breakfast
☐ 🎒 Get backpack
☐ 🚌 Go to school

**Tips for Success:**

✓ Place schedule where child can see and touch it
✓ Review schedule together before starting
✓ Let child move/check off completed items
✓ Use "first-then" boards for resistant activities
✓ Include preferred activities in the schedule
✓ Be consistent - same symbols, same location

**Transition Support:**
Add a "surprise" or "change" card for unexpected events. Practice using it during calm times so your child knows changes are okay.

**When to Update:**
- When mastering current level
- At start of new season/school year
- When routines change significantly',
  'article',
  'Daily Routines'
)
ON CONFLICT DO NOTHING;
