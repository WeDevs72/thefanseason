// This layout gives the admin/login page a standalone, clean shell
// It still inherits the root layout's <html>/<body> but renders NO Navbar/Footer
// by rendering children directly without the public site wrapper context.
// The AdminLoginPage component itself renders the full page with its own background.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
