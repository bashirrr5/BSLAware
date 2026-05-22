// Testing file to seed database with our test data

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {
	comments,
	dictionaryEntries,
	lessons,
	lessonVideos,
	quizQuestions,
	userLessonProgress
} from './schema';
import { randomUUID } from 'crypto';

// Connect directly — no $env imports
const client = new Database(process.env.DATABASE_URL!);
const db = drizzle(client);

// Clear tables in the right order — child tables first to avoid foreign key conflicts
await db.delete(userLessonProgress);
console.log('Cleared: userLessonProgress');
await db.delete(quizQuestions);
console.log('Cleared: quizQuestions');
await db.delete(lessonVideos);
console.log('Cleared: lessonVideos');
await db.delete(comments);
console.log('Cleared: comments');
await db.delete(lessons);
console.log('Cleared: lessons');

await db.delete(dictionaryEntries);
console.log('Cleared: dictionaryEntries');

console.log('Tables cleared');

// Now add data

const lessonId1 = randomUUID();
const lessonId2 = randomUUID();
const lessonId3 = randomUUID();

await db.insert(lessons).values([
	{
		id: lessonId1,
		title: 'Common Phrases',
		description: 'Learn common phrases.',
		order: 1
	},
	{
		id: lessonId2,
		title: 'BSL Alphabet',
		description: 'Learn the BSL alphabet used for fingerspelling.',
		order: 2
	},
	{
		id: lessonId3,
		title: 'Weather',
		description: 'Learn how to describe the weather.',
		order: 3
	}
]);

await db.insert(lessonVideos).values([
	// Example lesson 1
	{
		id: randomUUID(),
		lessonId: lessonId1,
		title: 'Hello, my name is...',
		youtubeId: 'Zz711bmuUBw',
		order: 1
	},
	{
		id: randomUUID(),
		lessonId: lessonId1,
		title: 'How are you?',
		youtubeId: '7cIQ-Aw6QjA',
		order: 2
	},
	// {
	// 	id: randomUUID(),
	// 	lessonId: lessonId1,
	// 	title: 'Old, Young, Older?',
	// 	youtubeId: 'eTSgM-rQ3W0',
	// 	order: 3
	// },

	// Example lesson 2
	{
		id: randomUUID(),
		lessonId: lessonId2,
		title: 'BSL Alphabet',
		youtubeId: 'gc7u-WPqPvo',
		order: 1
	},

	// Example lesson 3
	{
		id: randomUUID(),
		lessonId: lessonId3,
		title: 'Rainbow',
		youtubeId: 'QzLKo98knQc',
		order: 1
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		title: 'Rain',
		youtubeId: 'CqDWvP97ONQ',
		order: 2
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		title: 'Hot',
		youtubeId: 'jwCMswZefL4',
		order: 2
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		title: 'Cold',
		youtubeId: 'pQfGRJO34sU',
		order: 2
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		title: 'Hail',
		youtubeId: 'Nf0GR0-lTSo',
		order: 2
	}
]);

await db.insert(quizQuestions).values([
	// Lesson 1 questions
	{
		id: randomUUID(),
		lessonId: lessonId1,
		order: 1,
		question: 'What is the correct BSL sign for "Hello"?',
		options: JSON.stringify([
			'Wave your hand side to side',
			'Raise a flat hand from your forehead outward',
			'Tap your chin twice',
			'Touch your shoulder'
		]),
		correctAnswer: 0
	},
	{
		id: randomUUID(),
		lessonId: lessonId1,
		order: 2,
		question: 'When introducing yourself in BSL, what is the typical order?',
		options: JSON.stringify([
			'Name, then greeting',
			'Greeting, then name',
			'Name only — greetings are optional',
			'Age, then name, then greeting'
		]),
		correctAnswer: 1
	},

	// Lesson 2 questions
	{
		id: randomUUID(),
		lessonId: lessonId2,
		order: 1,
		question: 'Which hand is used as the base hand in two-handed BSL letters?',
		options: JSON.stringify([
			'Always the right hand',
			'Always the left hand',
			'Your non-dominant hand',
			'Your dominant hand'
		]),
		correctAnswer: 2
	},
	{
		id: randomUUID(),
		lessonId: lessonId2,
		order: 2,
		question: 'What is fingerspelling primarily used for in BSL?',
		options: JSON.stringify([
			'Spelling every word in a sentence',
			'Spelling proper nouns, names and words with no BSL sign',
			'Replacing all two-handed signs',
			'Communicating only with hearing people'
		]),
		correctAnswer: 1
	},

	{
		id: randomUUID(),
		lessonId: lessonId3,
		order: 2,
		question: 'How do you sign "Rainbow"',
		options: JSON.stringify([
			'Have a fist and do a waving motion with your hand',
			'Hold your hand out with fingers extended and do a waving motion',
			'You dont',
			'I forgot because I didnt pay attention'
		]),
		correctAnswer: 1
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		order: 1,
		question: 'How do you sign "Hot" in BSL?',
		options: JSON.stringify([
			'Wave both hands above your head like flames',
			'Fan your face with an open hand',
			'Wipe your index finter across your forehead',
			'Rub both palms together rapidly'
		]),
		correctAnswer: 2
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		order: 2,
		question: 'How do you sign "Cold" in BSL?',
		options: JSON.stringify([
			'Hold both fists close to your body and shiver with a shaking motion',
			'Place both hands flat on your cheeks',
			'Cross your arms and tap your shoulders',
			'Blow air from your mouth into your cupped hands'
		]),
		correctAnswer: 0
	},
	{
		id: randomUUID(),
		lessonId: lessonId3,
		order: 3,
		question: 'How do you sign "Rain" in BSL?',
		options: JSON.stringify([
			'Wave a flat hand side to side above your head',
			'Point both index fingers upward and wiggle them',
			'Hold both hands out with fingers spread and flutter them downward',
			'Tap the back of one hand with two fingers from the other'
		]),
		correctAnswer: 2
	}
]);

// Taken from youtube videos because couldnt find a free api
await db.insert(dictionaryEntries).values([
	// ── Weather ──────────────────────────────────────────
	{
		id: randomUUID(),
		word: 'Dark',
		category: 'Weather',
		description: 'A sign representing the absence of light or darkness.',
		videoId: '4kZLJXg6TTE',
		tags: JSON.stringify(['weather', 'beginner', 'environment'])
	},
	{
		id: randomUUID(),
		word: 'Light',
		category: 'Weather',
		description: 'A sign representing brightness or light.',
		videoId: 'hW-fGgBLsKo',
		tags: JSON.stringify(['weather', 'beginner', 'environment'])
	},
	{
		id: randomUUID(),
		word: 'Cold',
		category: 'Weather',
		description: 'A sign representing cold temperature or chilly weather.',
		videoId: 'pQfGRJO34sU',
		tags: JSON.stringify(['weather', 'beginner', 'temperature'])
	},
	{
		id: randomUUID(),
		word: 'Hot',
		category: 'Weather',
		description: 'A sign representing hot temperature or warm weather.',
		videoId: 'jwCMswZefL4',
		tags: JSON.stringify(['weather', 'beginner', 'temperature'])
	},
	{
		id: randomUUID(),
		word: 'Fog',
		category: 'Weather',
		description: 'A sign representing foggy or misty conditions.',
		videoId: 'J5uusdS425E',
		tags: JSON.stringify(['weather', 'intermediate', 'environment'])
	},
	{
		id: randomUUID(),
		word: 'Thunder',
		category: 'Weather',
		description: 'A sign representing thunder during a storm.',
		videoId: 'V4TXGCV9ZrY',
		tags: JSON.stringify(['weather', 'intermediate', 'storm'])
	},
	{
		id: randomUUID(),
		word: 'Snow',
		category: 'Weather',
		description: 'A sign representing snowfall or snowy conditions.',
		videoId: '0oLhhd3_V8k',
		tags: JSON.stringify(['weather', 'beginner', 'winter'])
	},
	{
		id: randomUUID(),
		word: 'Rainbow',
		category: 'Weather',
		description: 'A sign representing a rainbow appearing after rain.',
		videoId: 'va88e9G6to0',
		tags: JSON.stringify(['weather', 'beginner', 'colour'])
	},
	{
		id: randomUUID(),
		word: 'Rain',
		category: 'Weather',
		description: 'A sign representing rainfall or rainy weather.',
		videoId: 'CqDWvP97ONQ',
		tags: JSON.stringify(['weather', 'beginner', 'common'])
	},
	{
		id: randomUUID(),
		word: 'Sun',
		category: 'Weather',
		description: 'A sign representing sunshine or sunny weather.',
		videoId: 'O93f9--27HQ',
		tags: JSON.stringify(['weather', 'beginner', 'common'])
	},

	// ── Question Words ────────────────────────────────────
	{
		id: randomUUID(),
		word: 'How',
		category: 'Question Words',
		description: 'A sign used to ask how something is done or how someone is.',
		videoId: 'nlGhaifg6Oc',
		tags: JSON.stringify(['questions', 'beginner', 'common', 'grammar'])
	},
	{
		id: randomUUID(),
		word: 'Why',
		category: 'Question Words',
		description: 'A sign used to ask for a reason or explanation.',
		videoId: 'ELbTWACocSE',
		tags: JSON.stringify(['questions', 'beginner', 'common', 'grammar'])
	},
	{
		id: randomUUID(),
		word: 'Which',
		category: 'Question Words',
		description: 'A sign used to ask which option or choice is being referred to.',
		videoId: 'xR6h1zXNiiw',
		tags: JSON.stringify(['questions', 'beginner', 'grammar'])
	},
	{
		id: randomUUID(),
		word: 'Where',
		category: 'Question Words',
		description: 'A sign used to ask about a location or place.',
		videoId: 'Ta2auSPxikY',
		tags: JSON.stringify(['questions', 'beginner', 'common', 'grammar'])
	},
	{
		id: randomUUID(),
		word: 'When',
		category: 'Question Words',
		description: 'A sign used to ask about a time or date.',
		videoId: 'SuSf3heEz5M',
		tags: JSON.stringify(['questions', 'beginner', 'common', 'grammar'])
	},

	// ── Greetings ─────────────────────────────────────────
	{
		id: randomUUID(),
		word: 'Hello',
		category: 'Greetings',
		description: 'A friendly greeting sign used when meeting someone.',
		videoId: 'JLCpOc3ifdQ',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'essential'])
	},
	{
		id: randomUUID(),
		word: 'How Are You',
		category: 'Greetings',
		description: 'A common phrase used to ask someone how they are feeling.',
		videoId: '7cIQ-Aw6QjA',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'essential', 'phrases'])
	},
	{
		id: randomUUID(),
		word: 'Good Morning',
		category: 'Greetings',
		description: 'A greeting used in the morning to welcome someone to the day.',
		videoId: 'DSrn4pXEdMs',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'time-of-day'])
	},
	{
		id: randomUUID(),
		word: 'Good Afternoon',
		category: 'Greetings',
		description: 'A greeting used during the afternoon part of the day.',
		videoId: 'oMk-_fai7FI',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'time-of-day'])
	},
	{
		id: randomUUID(),
		word: 'Good Evening',
		category: 'Greetings',
		description: 'A greeting used in the evening when meeting someone.',
		videoId: '6UcWvhypRQM',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'time-of-day'])
	},
	{
		id: randomUUID(),
		word: 'Good Night',
		category: 'Greetings',
		description: 'A farewell sign used at the end of the day or before sleeping.',
		videoId: 'jw49mcJxvjk',
		tags: JSON.stringify(['greetings', 'beginner', 'common', 'time-of-day'])
	},

	// ── Phrases ───────────────────────────────────────────
	{
		id: randomUUID(),
		word: 'Can I Help You',
		category: 'Phrases',
		description: 'A helpful phrase used to offer assistance to someone.',
		videoId: 'g6fybbAc5FQ',
		tags: JSON.stringify(['phrases', 'beginner', 'common', 'polite'])
	},
	{
		id: randomUUID(),
		word: 'I Sign A Little',
		category: 'Phrases',
		description: 'A useful phrase to let a Deaf person know you have some BSL knowledge.',
		videoId: 'JW-Jse5Ep_A',
		tags: JSON.stringify(['phrases', 'beginner', 'essential', 'self-expression'])
	},
	{
		id: randomUUID(),
		word: 'Please / Thank You',
		category: 'Phrases',
		description:
			'Two essential polite signs — please and thank you share a similar handshape in BSL.',
		videoId: 'k4VyVP-JbXg',
		tags: JSON.stringify(['phrases', 'beginner', 'common', 'essential', 'polite'])
	}
]);

client.close();
console.log('Db seeded');
