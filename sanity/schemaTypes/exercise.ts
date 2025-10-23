import { defineField, defineType } from 'sanity'

export const exercise = defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  description: 'Exercise entries with details about workout movements and instructions',
  fields: [
    defineField({
      name: 'name',
      title: 'Exercise Name',
      type: 'string',
      description: 'The name of the exercise (e.g., Push-ups, Squats, Deadlifts)',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed description of how to perform the exercise, including form and technique',
      validation: (Rule) => Rule.required().min(10).max(500),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      description: 'The difficulty level of the exercise',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Exercise Image',
      type: 'image',
      description: 'Visual demonstration image of the exercise',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Alternative text for screen readers describing the exercise demonstration',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'string',
      description: 'URL to a video demonstration of the exercise (YouTube, Vimeo, etc.)',
      validation: (Rule) => 
        Rule.regex(/^https?:\/\/.+/, {
          name: 'url',
          invert: false,
        }).error('Please enter a valid URL starting with http:// or https://'),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this exercise is currently active and available for use',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'difficulty',
      media: 'image',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title,
        subtitle: subtitle ? `${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)} level` : 'No difficulty set',
      }
    },
  },
})
