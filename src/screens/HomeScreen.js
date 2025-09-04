import React from 'react';
import { View, ScrollView } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';

export default function HomeScreen() {
  const sampleBusinesses = [
    { id: 'b1', title: 'Venetian Blinds Fitters (VBF)', subtitle: 'Transform your space', image: 'https://images.unsplash.com/photo-1582582621952-0d00f1b0a3d7?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1543109740-4bdbf6f0efc1?q=80&w=256&auto=format&fit=crop', verified: true, location: '4 Nicolas Avenue Eastlea Harare' },
    { id: 'b2', title: 'R&D Plumbing, Tar & Projects', subtitle: 'Years of experience and commitment', image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Harare' },
    { id: 'b3', title: 'Aluminium Works', subtitle: 'Quality window solutions', image: 'https://images.unsplash.com/photo-1582582621952-0d00f1b0a3d7?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=256&auto=format&fit=crop', verified: false, location: 'Avondale' },
    { id: 'b4', title: 'Home Renovations', subtitle: 'Remodeling and design', image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Borrowdale' },
  ];

  const sampleRestaurants = [
    { id: 'r1', title: 'Mr Fish Zw', subtitle: 'The best fish in town', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Harare' },
    { id: 'r2', title: 'Spice Lounge', subtitle: 'Modern Indian cuisine showcasing', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=256&auto=format&fit=crop', verified: false, location: 'Borrowdale' },
    { id: 'r3', title: 'Cafe Aroma', subtitle: 'Artisan coffee and bakes', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Greendale' },
    { id: 'r4', title: 'Burger Hub', subtitle: 'Gourmet burgers and fries', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=256&auto=format&fit=crop', verified: true, location: 'CBD' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ paddingVertical: 8 }}>
      <ListingsGrid title="Businesses" data={sampleBusinesses} onPressItem={() => {}} />
      <ListingsGrid title="Restaurants and Bars" data={sampleRestaurants} onPressItem={() => {}} />
    </ScrollView>
  );
}


