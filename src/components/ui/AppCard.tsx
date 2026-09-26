/** Facade over shadcn/ui's real Card (src/components/ui/card.tsx). Keeps
 * the app's original sub-component names (CardBody, CardTitle used as a
 * plain heading) so existing pages didn't need a mechanical rewrite --
 * CardBody is just shadcn's CardContent re-exported under the old name. */
export { Card, CardContent as CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from './card'
