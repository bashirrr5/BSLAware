import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, headers }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, '/');
	}
};
