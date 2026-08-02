"use client"

import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from "@teispace/next-themes"
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const THEMES = [
  { icon: SunIcon, value: "light" },
  { icon: MoonIcon, value: "dark" },
  { icon: MonitorIcon, value: "system" },
] as const

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

function ThemeModeSelector() {
  const t = useTranslations("ThemeModeSelector")

  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const activeTheme = mounted ? (theme ?? "system") : "system"
  const ActiveThemeIcon =
    THEMES.find((entry) => entry.value === activeTheme)?.icon ?? MonitorIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Choose theme"
        className="inline-flex size-9 items-center justify-center rounded-md bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
      >
        <ActiveThemeIcon className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        {THEMES.map(({ value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setTheme(value)
            }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden />
              {t(`theme.${value}`)}
            </span>
            {activeTheme === value ? (
              <CheckIcon className="h-4 w-4" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeProvider, ThemeModeSelector }
