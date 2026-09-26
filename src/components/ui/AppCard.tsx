import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import {
  Card,
  CardContent as CardBody,
  CardDescription,
  CardFooter,
  CardHeader as ShadCardHeader,
  CardTitle as ShadCardTitle,
} from './card'

/** Facade over shadcn/ui's real Card (src/components/ui/card.tsx). Keeps
 * the app's original sub-component names (CardBody, CardTitle used as a
 * plain heading) so existing pages didn't need a mechanical rewrite.
 *
 * CardHeader/CardTitle get a couple of app-wide defaults on top of the raw
 * shadcn primitive: a bottom border + extra bottom padding on the header
 * (shadcn's own header has none by default, which made every section
 * title blend visually into the form right below it) and a slightly
 * bolder title weight so it reads as a section heading, not a label. */
function CardHeader({ className, ...props }: ComponentProps<typeof ShadCardHeader>) {
  return <ShadCardHeader className={cn('border-b border-border pb-4', className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<typeof ShadCardTitle>) {
  return <ShadCardTitle className={cn('text-base font-semibold', className)} {...props} />
}

export { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter }
