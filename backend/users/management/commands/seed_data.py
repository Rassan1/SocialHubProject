"""
Management command to seed the database with test data
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from events.models import Event, EventComment
from news.models import NewsPost
from chat.models import ChatRoom
import secrets


class Command(BaseCommand):
    help = 'Seeds the database with test data for development'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        # Clear existing data (optional - comment out if you want to keep existing data)
        self.stdout.write('Clearing existing data...')
        User.objects.all().delete()
        Event.objects.all().delete()
        NewsPost.objects.all().delete()
        ChatRoom.objects.all().delete()

        # Create Admin User
        self.stdout.write('Creating admin user...')
        admin = User.objects.create_user(
            email='admin@university.ac.uk',
            password='admin123',
            first_name='Admin',
            last_name='User',
            university='University of Surrey',
            accommodation_provider='',
            interests='administration, management',
            email_verified=True,
            is_staff=True,
            is_superuser=True,
            verification_token='',
            verification_token_created=timezone.now()
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Admin created: {admin.email}'))

        # Create Regular Student User
        self.stdout.write('Creating student user...')
        student = User.objects.create_user(
            email='student@university.ac.uk',
            password='TestPass123!',
            first_name='John',
            last_name='Doe',
            university='University of Surrey',
            accommodation_provider='Scape',
            interests='sports, music, technology',
            bio='Computer Science student who loves sports and music',
            email_verified=True,
            verification_token='',
            verification_token_created=timezone.now()
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Student created: {student.email}'))

        # Create Additional Test Users
        self.stdout.write('Creating additional test users...')
        test_users = []

        users_data = [
            {
                'email': 'alice@university.ac.uk',
                'password': 'TestPass123!',
                'first_name': 'Alice',
                'last_name': 'Smith',
                'accommodation_provider': 'Unite Students',
                'interests': 'study, books, coffee',
                'bio': 'Medical student looking for study partners'
            },
            {
                'email': 'bob@university.ac.uk',
                'password': 'TestPass123!',
                'first_name': 'Bob',
                'last_name': 'Johnson',
                'accommodation_provider': 'Scape',
                'interests': 'gaming, movies, technology',
                'bio': 'Engineering student and gaming enthusiast'
            },
            {
                'email': 'emma@university.ac.uk',
                'password': 'TestPass123!',
                'first_name': 'Emma',
                'last_name': 'Wilson',
                'accommodation_provider': 'IQ Student Accommodation',
                'interests': 'fitness, cooking, photography',
                'bio': 'Business student passionate about fitness'
            },
            {
                'email': 'charlie@university.ac.uk',
                'password': 'TestPass123!',
                'first_name': 'Charlie',
                'last_name': 'Brown',
                'accommodation_provider': 'Fresh Student Living',
                'interests': 'music, concerts, socializing',
                'bio': 'Music student and part-time DJ'
            }
        ]

        for user_data in users_data:
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                university='University of Surrey',
                accommodation_provider=user_data['accommodation_provider'],
                interests=user_data['interests'],
                bio=user_data['bio'],
                email_verified=True,
                verification_token='',
                verification_token_created=timezone.now()
            )
            test_users.append(user)
            self.stdout.write(self.style.SUCCESS(f'✓ User created: {user.email}'))

        # Create Events
        self.stdout.write('\nCreating events...')
        now = timezone.now()

        events_data = [
            {
                'title': 'Football Match',
                'description': 'Friendly football match at Scape Sports Field. All skill levels welcome!',
                'category': 'SPORTS',
                'location': 'Scape Sports Field',
                'start_time': now + timedelta(days=2, hours=18),
                'end_time': now + timedelta(days=2, hours=20),
                'max_attendees': 20,
                'tags': 'football, sports, outdoor',
                'creator': student
            },
            {
                'title': 'Study Group - Mathematics',
                'description': 'Weekly mathematics study session. Bring your questions and materials.',
                'category': 'STUDY',
                'location': 'Unite Students Common Room',
                'start_time': now + timedelta(days=1, hours=15),
                'end_time': now + timedelta(days=1, hours=18),
                'max_attendees': 10,
                'tags': 'study, mathematics, homework',
                'creator': test_users[0]  # Alice
            },
            {
                'title': 'Movie Night - Latest Blockbuster',
                'description': 'Join us for a movie night! Popcorn and snacks provided.',
                'category': 'ENTERTAINMENT',
                'location': 'IQ Student Accommodation Cinema',
                'start_time': now + timedelta(days=3, hours=19),
                'end_time': now + timedelta(days=3, hours=22),
                'max_attendees': 30,
                'tags': 'movies, entertainment, social',
                'creator': test_users[2]  # Emma
            },
            {
                'title': 'Pizza Party',
                'description': 'Free pizza for all students! Come socialize and meet new people.',
                'category': 'FOOD',
                'location': 'Scape Courtyard',
                'start_time': now + timedelta(days=4, hours=18),
                'end_time': now + timedelta(days=4, hours=21),
                'max_attendees': 50,
                'tags': 'food, social, pizza',
                'creator': admin
            },
            {
                'title': 'Gaming Tournament - FIFA',
                'description': 'FIFA gaming tournament with prizes! Sign up now.',
                'category': 'ENTERTAINMENT',
                'location': 'Fresh Student Living Game Room',
                'start_time': now + timedelta(days=5, hours=14),
                'end_time': now + timedelta(days=5, hours=18),
                'max_attendees': 16,
                'tags': 'gaming, competition, fifa',
                'creator': test_users[1]  # Bob
            },
            {
                'title': 'Live Music Night',
                'description': 'Local bands performing live! Free entry for students.',
                'category': 'ENTERTAINMENT',
                'location': 'Unite Students Hall',
                'start_time': now + timedelta(days=6, hours=20),
                'end_time': now + timedelta(days=6, hours=23),
                'max_attendees': 100,
                'tags': 'music, live, entertainment',
                'creator': test_users[3]  # Charlie
            },
            {
                'title': 'Yoga Session',
                'description': 'Beginner-friendly yoga session. Bring your own mat.',
                'category': 'SPORTS',
                'location': 'IQ Student Accommodation Gym',
                'start_time': now + timedelta(days=7, hours=8),
                'end_time': now + timedelta(days=7, hours=9),
                'max_attendees': 15,
                'tags': 'yoga, fitness, wellness',
                'creator': test_users[2]  # Emma
            }
        ]

        created_events = []
        for index, event_data in enumerate(events_data):
            event = Event.objects.create(**event_data)
            created_events.append(event)
            self.stdout.write(self.style.SUCCESS(f'✓ Event created: {event.title}'))

            # Add attendees to only some events (not all) so recommendations work
            # Student attends first 3 events, others attend different events
            if index < 3:
                event.attendees.add(student, test_users[0])
            elif index < 5:
                event.attendees.add(test_users[1], test_users[2])
            # Leave last 2 events without the main student attending

            # Add comments to some events
            if index < 4:
                EventComment.objects.create(
                    event=event,
                    author=student if index < 2 else test_users[index % len(test_users)],
                    content='Looking forward to this!'
                )

        # Create News Posts
        self.stdout.write('\nCreating news posts...')

        news_data = [
            {
                'title': 'New Accommodation Rules',
                'content': 'Please note the updated quiet hours are now from 10 PM to 8 AM on weekdays. Thank you for your cooperation.',
                'category': 'ANNOUNCEMENT',
                'accommodation_provider': 'Scape',
                'is_pinned': True,
                'author': admin
            },
            {
                'title': 'Maintenance Schedule - Water',
                'content': 'Water will be shut off on Friday, March 1st from 9 AM to 12 PM for routine maintenance. Please plan accordingly.',
                'category': 'MAINTENANCE',
                'accommodation_provider': 'Unite Students',
                'is_pinned': True,
                'author': admin
            },
            {
                'title': 'Community BBQ This Weekend',
                'content': 'Join us for a community BBQ this Saturday at 2 PM in the courtyard. All residents welcome!',
                'category': 'EVENT',
                'accommodation_provider': '',
                'is_pinned': False,
                'author': admin
            },
            {
                'title': 'WiFi Upgrade Complete',
                'content': 'The WiFi upgrade has been completed. You should now experience faster internet speeds throughout the building.',
                'category': 'UPDATE',
                'accommodation_provider': 'Fresh Student Living',
                'is_pinned': False,
                'author': admin
            },
            {
                'title': 'Security Alert',
                'content': 'Please ensure all doors are locked when leaving your accommodation. There have been reports of unauthorized access in the area.',
                'category': 'ALERT',
                'accommodation_provider': '',
                'is_pinned': True,
                'author': admin
            }
        ]

        for news_item in news_data:
            news = NewsPost.objects.create(**news_item)
            self.stdout.write(self.style.SUCCESS(f'✓ News created: {news.title}'))

        # Create some chat rooms
        self.stdout.write('\nCreating chat rooms...')

        # Direct message between student and Alice
        dm_room = ChatRoom.objects.create(
            name='',
            room_type='DIRECT'
        )
        dm_room.participants.add(student, test_users[0])
        self.stdout.write(self.style.SUCCESS(f'✓ DM room created between {student.first_name} and {test_users[0].first_name}'))

        # Group chat for Football event
        football_event = created_events[0]
        group_room = ChatRoom.objects.create(
            name='Football Match Discussion',
            room_type='EVENT',
            event=football_event
        )
        group_room.participants.add(student, test_users[0], test_users[1])
        self.stdout.write(self.style.SUCCESS(f'✓ Event room created for: {football_event.title}'))

        # General group chat
        general_group = ChatRoom.objects.create(
            name='Scape Residents',
            room_type='GROUP'
        )
        general_group.participants.add(student, test_users[1], admin)
        self.stdout.write(self.style.SUCCESS('✓ Group chat created: Scape Residents'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS('\nTest Accounts Created:'))
        self.stdout.write(self.style.WARNING('\nAdmin Account:'))
        self.stdout.write(f'  Email: admin@university.ac.uk')
        self.stdout.write(f'  Password: admin123')
        self.stdout.write(self.style.WARNING('\nStudent Account:'))
        self.stdout.write(f'  Email: student@university.ac.uk')
        self.stdout.write(f'  Password: TestPass123!')
        self.stdout.write(self.style.WARNING('\nOther Test Users:'))
        for user_data in users_data:
            self.stdout.write(f'  Email: {user_data["email"]} | Password: TestPass123!')
        self.stdout.write(self.style.SUCCESS(f'\nTotal Users: {User.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total Events: {Event.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total News Posts: {NewsPost.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total Chat Rooms: {ChatRoom.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('='*50 + '\n'))
