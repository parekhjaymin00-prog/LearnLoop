export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        By using LearnLoop, you agree to use the platform responsibly 
        and respect other community members.
      </p>
      <p className="text-muted-foreground mb-4">
        Content shared on LearnLoop should be educational and appropriate. 
        We reserve the right to remove content that violates community guidelines.
      </p>
      <p className="text-muted-foreground mb-4">
        These terms may be updated periodically. Continued use of the 
        platform constitutes acceptance of any changes.
      </p>
      <a href="/" className="text-primary underline">← Back to Home</a>
    </div>
  );
}
