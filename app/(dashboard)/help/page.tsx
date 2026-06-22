import { createClient } from "@/lib/supabase/server"
import { getServerT } from "@/lib/i18n/server"
import { TopBar } from "@/components/dashboard/top-bar"
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  FileText,
  ExternalLink,
  ChevronDown,
} from "lucide-react"
import { ContactForm } from "./contact-form"

export default async function HelpCenterPage() {
  const [supabase, t] = await Promise.all([createClient(), getServerT()])
  const { data: userData } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userData.user?.id)
    .single()

  const faqs = [
    { question: t("help.faq1Q"), answer: t("help.faq1A") },
    { question: t("help.faq2Q"), answer: t("help.faq2A") },
    { question: t("help.faq3Q"), answer: t("help.faq3A") },
    { question: t("help.faq4Q"), answer: t("help.faq4A") },
    { question: t("help.faq5Q"), answer: t("help.faq5A") },
  ]

  return (
    <div>
      <TopBar
        title={t("help.title")}
        subtitle={t("help.subtitle")}
        profile={profile}
      />

      <div className="mx-auto w-full max-w-[1400px] p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Main FAQ Content */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  {t("help.faqTitle")}
                </h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-lg border border-border bg-accent/30 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                      {faq.question}
                      <span className="transition group-open:-rotate-180">
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </summary>
                    <div className="border-t border-border/50 p-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="#"
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {t("help.documentation")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("help.readGuides")}
                  </p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href="#"
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {t("help.communityForum")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("help.joinOwners")}
                  </p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                {t("help.contactSupport")}
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                {t("help.cantFind")}
              </p>

              <ContactForm />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-bold text-foreground">
                {t("help.otherWays")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("help.emailSupport")}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      support@beautyai.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("help.phonePro")}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      +1 (800) 123-4567
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
