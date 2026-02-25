from django.core.management.base import BaseCommand
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout
from datetime import date


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting existing data...')
        Leaderboard.objects.all().delete()
        Activity.objects.all().delete()
        Team.objects.all().delete()
        User.objects.all().delete()
        Workout.objects.all().delete()

        self.stdout.write('Creating users (superheroes)...')
        users_data = [
            {'username': 'ironman', 'email': 'ironman@marvel.com', 'password': 'password123'},
            {'username': 'spiderman', 'email': 'spiderman@marvel.com', 'password': 'password123'},
            {'username': 'blackwidow', 'email': 'blackwidow@marvel.com', 'password': 'password123'},
            {'username': 'thor', 'email': 'thor@marvel.com', 'password': 'password123'},
            {'username': 'captainamerica', 'email': 'captainamerica@marvel.com', 'password': 'password123'},
            {'username': 'batman', 'email': 'batman@dc.com', 'password': 'password123'},
            {'username': 'superman', 'email': 'superman@dc.com', 'password': 'password123'},
            {'username': 'wonderwoman', 'email': 'wonderwoman@dc.com', 'password': 'password123'},
            {'username': 'theflash', 'email': 'theflash@dc.com', 'password': 'password123'},
            {'username': 'greenlantern', 'email': 'greenlantern@dc.com', 'password': 'password123'},
        ]

        users = {}
        for u in users_data:
            user = User.objects.create(**u)
            users[u['username']] = user
            self.stdout.write(f"  Created user: {u['username']}")

        self.stdout.write('Creating teams...')
        team_marvel = Team.objects.create(name='Team Marvel')
        team_marvel.members.set([
            users['ironman'], users['spiderman'], users['blackwidow'],
            users['thor'], users['captainamerica']
        ])
        team_marvel.save()
        self.stdout.write('  Created team: Team Marvel')

        team_dc = Team.objects.create(name='Team DC')
        team_dc.members.set([
            users['batman'], users['superman'], users['wonderwoman'],
            users['theflash'], users['greenlantern']
        ])
        team_dc.save()
        self.stdout.write('  Created team: Team DC')

        self.stdout.write('Creating activities...')
        activities_data = [
            {'user': users['ironman'], 'activity_type': 'Running', 'duration': 45.0, 'date': date(2024, 1, 10)},
            {'user': users['spiderman'], 'activity_type': 'Climbing', 'duration': 60.0, 'date': date(2024, 1, 11)},
            {'user': users['blackwidow'], 'activity_type': 'Martial Arts', 'duration': 90.0, 'date': date(2024, 1, 12)},
            {'user': users['thor'], 'activity_type': 'Weightlifting', 'duration': 55.0, 'date': date(2024, 1, 13)},
            {'user': users['captainamerica'], 'activity_type': 'Shield Training', 'duration': 40.0, 'date': date(2024, 1, 14)},
            {'user': users['batman'], 'activity_type': 'Parkour', 'duration': 70.0, 'date': date(2024, 1, 10)},
            {'user': users['superman'], 'activity_type': 'Flying', 'duration': 30.0, 'date': date(2024, 1, 11)},
            {'user': users['wonderwoman'], 'activity_type': 'Sword Training', 'duration': 80.0, 'date': date(2024, 1, 12)},
            {'user': users['theflash'], 'activity_type': 'Sprinting', 'duration': 15.0, 'date': date(2024, 1, 13)},
            {'user': users['greenlantern'], 'activity_type': 'Ring Constructs', 'duration': 50.0, 'date': date(2024, 1, 14)},
        ]

        for a in activities_data:
            Activity.objects.create(**a)
            self.stdout.write(f"  Created activity: {a['user'].username} - {a['activity_type']}")

        self.stdout.write('Creating leaderboard entries...')
        leaderboard_data = [
            {'user': users['ironman'], 'score': 980},
            {'user': users['spiderman'], 'score': 850},
            {'user': users['blackwidow'], 'score': 920},
            {'user': users['thor'], 'score': 970},
            {'user': users['captainamerica'], 'score': 890},
            {'user': users['batman'], 'score': 960},
            {'user': users['superman'], 'score': 1000},
            {'user': users['wonderwoman'], 'score': 940},
            {'user': users['theflash'], 'score': 1050},
            {'user': users['greenlantern'], 'score': 870},
        ]

        for lb in leaderboard_data:
            Leaderboard.objects.create(**lb)
            self.stdout.write(f"  Created leaderboard entry: {lb['user'].username} - {lb['score']}")

        self.stdout.write('Creating workouts...')
        workouts_data = [
            {
                'name': 'Iron Man Cardio Blast',
                'description': 'High-intensity cardio circuit inspired by Iron Man suit drills.',
                'duration': 45.0
            },
            {
                'name': 'Spider-Man Agility Course',
                'description': 'Agility and flexibility training for crime-fighting reflexes.',
                'duration': 60.0
            },
            {
                'name': 'Black Widow Combat Training',
                'description': 'Martial arts and self-defense workout for elite operatives.',
                'duration': 90.0
            },
            {
                'name': 'Batman Strength & Endurance',
                'description': 'Full-body strength and endurance workout to master Gotham\'s nights.',
                'duration': 75.0
            },
            {
                'name': 'Superman Power Training',
                'description': 'Power and speed training for superhuman performance.',
                'duration': 30.0
            },
        ]

        for w in workouts_data:
            Workout.objects.create(**w)
            self.stdout.write(f"  Created workout: {w['name']}")

        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
