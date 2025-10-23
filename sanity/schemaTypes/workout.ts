import { defineField, defineType, defineArrayMember } from 'sanity'

export const workout = defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  description: 'User workout sessions with exercises, reps, and weights',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID of the person who performed this workout',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      type: 'datetime',
      description: 'Date and time when the workout was performed',
      validation: (Rule) => Rule.required(),
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15,
      },
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Total workout duration in seconds',
      validation: (Rule) => Rule.required().min(1).max(86400), // Max 24 hours
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      type: 'array',
      description: 'List of exercises performed in this workout with sets, reps, and weights',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              type: 'array',
              description: 'Individual sets performed for this exercise',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      type: 'number',
                      description: 'Number of repetitions performed in this set',
                      validation: (Rule) => Rule.required().min(1).max(1000),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      type: 'number',
                      description: 'Weight used for this set (can be 0 for bodyweight exercises)',
                      validation: (Rule) => Rule.min(0).max(10000),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      type: 'string',
                      description: 'Unit of measurement for the weight',
                      options: {
                        list: [
                          { title: 'Pounds (lbs)', value: 'lbs' },
                          { title: 'Kilograms (kg)', value: 'kg' },
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'lbs',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare(selection) {
                      const { reps, weight, weightUnit } = selection
                      const weightDisplay = weight > 0 ? `${weight} ${weightUnit}` : 'Bodyweight'
                      return {
                        title: `${reps} reps`,
                        subtitle: weightDisplay,
                      }
                    },
                  },
                }),
              ],
              validation: (Rule) => Rule.min(1).error('At least one set is required'),
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exercise.name',
              sets: 'sets',
            },
            prepare(selection) {
              const { exerciseName, sets } = selection
              const setCount = sets ? sets.length : 0
              return {
                title: exerciseName || 'Unknown Exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('At least one exercise is required'),
    }),
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
      userId: 'userId',
    },
    prepare(selection) {
      const { date, duration, exercises, userId } = selection

      // Format date
      const workoutDate = date ? new Date(date).toLocaleDateString() : 'No date'

      // Format duration
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const durationDisplay = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m`

      // Exercise count
      const exerciseCount = exercises ? exercises.length : 0

      return {
        title: `Workout - ${workoutDate}`,
        subtitle: `${durationDisplay} • ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • User: ${userId?.slice(-8) || 'Unknown'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Duration (longest first)',
      name: 'durationDesc',
      by: [{ field: 'duration', direction: 'desc' }],
    },
  ],
})
