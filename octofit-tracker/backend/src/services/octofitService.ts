import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid request body'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;

  if (!userId || typeof userId !== 'string') {
    throw Object.assign(new Error('userId is required and must be a string'), { status: 400 });
  }
  if (!teamId || typeof teamId !== 'string') {
    throw Object.assign(new Error('teamId is required and must be a string'), { status: 400 });
  }
  if (!type || typeof type !== 'string') {
    throw Object.assign(new Error('type is required and must be a string'), { status: 400 });
  }
  if (typeof minutes !== 'number' || minutes <= 0) {
    throw Object.assign(new Error('minutes is required and must be a positive number'), { status: 400 });
  }

  // Validate ObjectId format
  if (!userId.match(/^[0-9a-f]{24}$/i)) {
    throw Object.assign(new Error('userId must be a valid MongoDB ObjectId'), { status: 400 });
  }
  if (!teamId.match(/^[0-9a-f]{24}$/i)) {
    throw Object.assign(new Error('teamId must be a valid MongoDB ObjectId'), { status: 400 });
  }

  // Check if user and team exist
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 400 });
  }

  // Calculate points based on minutes and type
  const points = minutes;

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  const teams = await Team.find().lean();
  return teams.map(team => ({
    ...team,
    members: (team.members || []).map((id: any) => id.toString ? id.toString() : id),
  }));
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid request body'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;

  if (!name || typeof name !== 'string') {
    throw Object.assign(new Error('name is required and must be a string'), { status: 400 });
  }
  if (!mascot || typeof mascot !== 'string') {
    throw Object.assign(new Error('mascot is required and must be a string'), { status: 400 });
  }

  // Validate members array if provided
  let memberIds: string[] = [];
  if (members) {
    if (!Array.isArray(members)) {
      throw Object.assign(new Error('members must be an array'), { status: 400 });
    }
    memberIds = members as string[];
    for (const memberId of memberIds) {
      if (!memberId.match(/^[0-9a-f]{24}$/i)) {
        throw Object.assign(new Error('Invalid member ID format'), { status: 400 });
      }
      const user = await User.findById(memberId);
      if (!user) {
        throw Object.assign(new Error('Member not found'), { status: 400 });
      }
    }
  }

  const team = await Team.create({
    name,
    mascot,
    members: memberIds,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const result = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    {
      $unwind: '$team',
    },
    {
      $sort: { totalPoints: -1 },
    },
    {
      $project: {
        teamName: '$team.name',
        totalPoints: 1,
        _id: 0,
      },
    },
  ]);

  // Add rank based on position
  return result.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  // Decode URL-encoded email
  const decodedEmail = decodeURIComponent(userEmail);
  
  // Find the user by email
  const user = await User.findOne({ email: decodedEmail });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  const fitnessGoal = user.fitnessGoal;

  // Map fitness goals to workout focus areas
  const goalToFocus: Record<string, string> = {
    endurance: 'endurance',
    strength: 'strength',
    agility: 'agility',
    flexibility: 'flexibility',
  };

  const targetFocus = goalToFocus[fitnessGoal] || fitnessGoal;

  // Get user's recent activities to understand their activity pattern
  const userActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean();

  // Find workouts matching the user's fitness goal
  const workouts = await Workout.find({ focus: targetFocus }).lean();

  // Add reasons based on user's activities and goals
  const suggestions = workouts.map(workout => {
    let reason = `Matches your ${fitnessGoal} fitness goal`;
    
    if (userActivities.length > 0) {
      const recentActivityType = userActivities[0].type;
      reason = `Based on your recent ${recentActivityType} activity and ${fitnessGoal} goal`;
    }

    return {
      ...workout,
      reason,
    };
  });

  return suggestions;
}

export { User };
