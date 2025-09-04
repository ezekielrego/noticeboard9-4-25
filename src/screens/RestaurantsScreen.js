import React from 'react';
import { ScrollView } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';

export default function RestaurantsScreen() {
  const sample = [
    { id: 'r1', title: 'Mr Fish Zw', subtitle: 'The best fish in town', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Harare' },
    { id: 'r2', title: 'Spice Lounge', subtitle: 'Modern Indian cuisine showcasing', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=256&auto=format&fit=crop', verified: false, location: 'Borrowdale' },
    { id: 'r3', title: 'Cafe Aroma', subtitle: 'Artisan coffee and bakes', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Greendale' },
    { id: 'r4', title: 'Burger Hub', subtitle: 'Gourmet burgers and fries', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=256&auto=format&fit=crop', verified: true, location: 'CBD' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ paddingVertical: 8 }}>
      <ListingsGrid title="Restaurants and Bars" data={sample} onPressItem={() => {}} />
    </ScrollView>
  );
}


