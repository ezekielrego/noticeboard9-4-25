import React from 'react';
import { ScrollView } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';

export default function EventsScreen() {
  const sample = [
    { id: 'e1', title: 'Street Food Festival', subtitle: 'Live music and pop-up stalls', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1532635035-8a79b3e4a1d6?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Harare Gardens' },
    { id: 'e2', title: 'Tech Meetup', subtitle: 'Dev talks and networking', image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1545127398-14699f92334c?q=80&w=256&auto=format&fit=crop', verified: false, location: 'Borrowdale' },
    { id: 'e3', title: 'Farmers Market', subtitle: 'Organic produce and crafts', image: 'https://images.unsplash.com/photo-1524594227084-95dc01c7cd2f?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=256&auto=format&fit=crop', verified: true, location: 'Avondale' },
    { id: 'e4', title: 'Art Expo', subtitle: 'Local artists showcase', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop', logo: 'https://images.unsplash.com/photo-1520975931170-3f54def7bc87?q=80&w=256&auto=format&fit=crop', verified: true, location: 'CBD' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ paddingVertical: 8 }}>
      <ListingsGrid title="Events" data={sample} onPressItem={() => {}} />
    </ScrollView>
  );
}


