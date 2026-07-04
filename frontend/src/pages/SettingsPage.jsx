import ProviderSettings from "@/components/ProviderSettings"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Settings
      </h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Connect an AI provider to chat about projects — pick a provider, add your own API key,
        and choose a model. Once saved, every project page unlocks a chat assistant that can
        answer questions using that project&apos;s public spending data.
      </p>

      <div className="mt-8">
        <ProviderSettings />
      </div>
    </div>
  )
}
