export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        LearnLoop collects only the information necessary to provide 
        our service — your name, email address, and content you share.
      </p>
      <p className="text-muted-foreground mb-4">
        We do not sell your personal data to third parties. 
        Your data is stored securely and used only to operate the platform.
      </p>
      <p className="text-muted-foreground mb-4">
        You may request deletion of your account and data at any time 
        by contacting us.
      </p>
      <a href="/" className="text-primary underline">← Back to Home</a>
    </div>
  );
}
