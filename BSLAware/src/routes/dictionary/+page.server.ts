import { db } from '$lib/server/db';
import { dictionaryEntries } from '$lib/server/db/schema';
import { like, asc, or, and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q')?.trim() ?? '';
	const category = url.searchParams.get('category')?.trim() ?? '';

	const conditions = [];

	if (search) {
		conditions.push(
			or(
				like(dictionaryEntries.word, `%${search}%`),
				like(dictionaryEntries.description, `%${search}%`),
				like(dictionaryEntries.tags, `%${search}%`)
			)
		);
	}

	if (category) {
		conditions.push(eq(dictionaryEntries.category, category));
	}

	const entries = await db
		.select()
		.from(dictionaryEntries)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(asc(dictionaryEntries.word));

	const allCategories = await db
		.selectDistinct({ category: dictionaryEntries.category })
		.from(dictionaryEntries)
		.orderBy(asc(dictionaryEntries.category));

	return {
		entries: entries.map((e) => ({ ...e, tags: JSON.parse(e.tags) as string[] })),
		categories: allCategories.map((r) => r.category),
		search,
		category,
		total: entries.length
	};
};
