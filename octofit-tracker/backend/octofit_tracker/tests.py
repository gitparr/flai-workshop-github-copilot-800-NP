from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Team, Activity, Leaderboard, Workout
from datetime import date


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='testuser',
            email='testuser@example.com',
            password='testpass123'
        )

    def tearDown(self):
        User.objects.all().delete()

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'testuser@example.com')

    def test_user_str(self):
        self.assertEqual(str(self.user), 'testuser')


class TeamModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='teamuser',
            email='teamuser@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team')
        self.team.members.add(self.user)

    def tearDown(self):
        Team.objects.all().delete()
        User.objects.all().delete()

    def test_team_creation(self):
        self.assertEqual(self.team.name, 'Test Team')

    def test_team_members(self):
        self.assertIn(self.user, self.team.members.all())

    def test_team_str(self):
        self.assertEqual(str(self.team), 'Test Team')


class ActivityModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='activityuser',
            email='activityuser@example.com',
            password='testpass123'
        )
        self.activity = Activity.objects.create(
            user=self.user,
            activity_type='Running',
            duration=30.0,
            date=date(2024, 1, 1)
        )

    def tearDown(self):
        Activity.objects.all().delete()
        User.objects.all().delete()

    def test_activity_creation(self):
        self.assertEqual(self.activity.activity_type, 'Running')
        self.assertEqual(self.activity.duration, 30.0)

    def test_activity_str(self):
        self.assertIn('activityuser', str(self.activity))
        self.assertIn('Running', str(self.activity))


class LeaderboardModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='lbuser',
            email='lbuser@example.com',
            password='testpass123'
        )
        self.entry = Leaderboard.objects.create(user=self.user, score=500)

    def tearDown(self):
        Leaderboard.objects.all().delete()
        User.objects.all().delete()

    def test_leaderboard_creation(self):
        self.assertEqual(self.entry.score, 500)

    def test_leaderboard_str(self):
        self.assertIn('lbuser', str(self.entry))
        self.assertIn('500', str(self.entry))


class WorkoutModelTest(TestCase):
    def setUp(self):
        self.workout = Workout.objects.create(
            name='Test Workout',
            description='A test workout description.',
            duration=45.0
        )

    def tearDown(self):
        Workout.objects.all().delete()

    def test_workout_creation(self):
        self.assertEqual(self.workout.name, 'Test Workout')
        self.assertEqual(self.workout.duration, 45.0)

    def test_workout_str(self):
        self.assertEqual(str(self.workout), 'Test Workout')


class APIRootTest(APITestCase):
    def test_api_root(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('users', response.data)
        self.assertIn('teams', response.data)
        self.assertIn('activities', response.data)
        self.assertIn('leaderboard', response.data)
        self.assertIn('workouts', response.data)

    def test_api_prefix_root(self):
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='apiuser',
            email='apiuser@example.com',
            password='testpass123'
        )

    def tearDown(self):
        User.objects.all().delete()

    def test_list_users(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user(self):
        response = self.client.get(f'/api/users/{self.user.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'apiuser')


class TeamAPITest(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name='API Team')

    def tearDown(self):
        Team.objects.all().delete()

    def test_list_teams(self):
        response = self.client.get('/api/teams/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ActivityAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='actapi',
            email='actapi@example.com',
            password='testpass123'
        )
        self.activity = Activity.objects.create(
            user=self.user,
            activity_type='Cycling',
            duration=60.0,
            date=date(2024, 2, 1)
        )

    def tearDown(self):
        Activity.objects.all().delete()
        User.objects.all().delete()

    def test_list_activities(self):
        response = self.client.get('/api/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LeaderboardAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='lbapi',
            email='lbapi@example.com',
            password='testpass123'
        )
        self.entry = Leaderboard.objects.create(user=self.user, score=750)

    def tearDown(self):
        Leaderboard.objects.all().delete()
        User.objects.all().delete()

    def test_list_leaderboard(self):
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class WorkoutAPITest(APITestCase):
    def setUp(self):
        self.workout = Workout.objects.create(
            name='API Workout',
            description='Workout via API test.',
            duration=30.0
        )

    def tearDown(self):
        Workout.objects.all().delete()

    def test_list_workouts(self):
        response = self.client.get('/api/workouts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
