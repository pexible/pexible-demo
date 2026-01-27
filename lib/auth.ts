import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Demo Access',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.password === process.env.DEMO_PASSWORD) {
          return { id: 'demo', name: 'Demo User' }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as Record<string, unknown>).id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as Record<string, unknown>).id = token.id
      return session
    }
  }
}
