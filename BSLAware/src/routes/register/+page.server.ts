import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/learn');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		console.log('name', data, 'email', email, 'paswordm', password, confirmPassword);

		if (!name || !email || !password || !confirmPassword) {
			return fail(400, { error: 'Please fill in all fields.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name: name,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { error: error.message || 'Registration failed' });
			}
			return fail(500, { error: 'Unexpected error' });
		}

		redirect(302, '/learn');
	}
};
