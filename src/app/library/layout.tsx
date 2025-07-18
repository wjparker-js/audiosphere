import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Library - AudioSphere',
  description: 'Manage your personal content including albums, playlists, and blog posts',
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}