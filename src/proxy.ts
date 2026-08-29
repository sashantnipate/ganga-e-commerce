import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that Clerk should completely ignore
const isPayloadRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk execution for Payload routes
  if (isPayloadRoute(req)) {
    return
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}