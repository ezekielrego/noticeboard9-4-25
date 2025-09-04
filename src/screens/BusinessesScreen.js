import React from 'react';
import { ScrollView } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';

export default function BusinessesScreen() {
  const sample = [
    { id: 'b1', title: 'Venetian Blinds Fitters (VBF)', subtitle: 'Transform your space', image: 'https://images.unsplash.com/photo-1582582621952-0d00f1b0a3d7?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1543109740-4bdbf6f0efc1?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Eastlea, Harare' },
    { id: 'b2', title: 'R&D Plumbing', subtitle: 'Reliable and experienced', image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Harare' },
    { id: 'b3', title: 'Aluminium Works', subtitle: 'Premium window solutions', image: 'https://images.unsplash.com/photo-1582582621952-0d00f1b0a3d7?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=256&auto=format&fit=crop', verified: false, location: 'Avondale' },
    { id: 'b4', title: 'Home Renovations', subtitle: 'Remodeling and design', image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Borrowdale' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ paddingVertical: 8 }}>
      <ListingsGrid title="Businesses" data={sample} onPressItem={() => {}} />
    </ScrollView>
  );
}


