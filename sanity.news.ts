import {defineArrayMember, defineField, defineType} from 'sanity';

export default defineType({
  name: 'newsStory',
  title: 'News stories',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Headline', type: 'string', validation: rule => rule.required()}),
    defineField({
      name: 'path', title: 'Website path', type: 'string',
      description: 'Use /YYYY/MM/DD/story-slug/ for a new story. Existing paths stay fixed.',
      readOnly: ({document}) => Boolean(document?.legacy),
      validation: rule => rule.required().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/$/).custom(async (path, context) => {
        if (!path || !context.document?._id) return true;
        const client = context.getClient({apiVersion: '2026-10-10'});
        const id = context.document._id.replace(/^drafts\./, '');
        const duplicate = await client.fetch(
          'defined(*[_type == "newsStory" && path == $path && !(_id in [$id, $draft])][0]._id)',
          {path, id, draft: `drafts.${id}`},
        );
        return duplicate ? 'This website path already belongs to another story.' : true;
      }),
    }),
    defineField({name: 'publishedOn', title: 'Publish date', type: 'date', validation: rule => rule.required()}),
    defineField({name: 'summary', type: 'text', rows: 3}),
    defineField({name: 'cover', title: 'Cover image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'alt', title: 'Cover image description', type: 'string',
      validation: rule => rule.custom((value, context) => !context.document?.cover || value?.trim() ? true : 'Describe the cover image.'),
    }),
    defineField({
      name: 'body', type: 'array', of: [defineArrayMember({type: 'block'})],
      description: 'An imported article keeps its original body until you publish replacement content here.',
      validation: rule => rule.custom((value, context) => value?.length || context.document?.hasLegacyBody ? true : 'Add the article body before publishing.'),
    }),
    defineField({name: 'legacy', type: 'boolean', hidden: true, readOnly: true}),
    defineField({name: 'hasLegacyBody', type: 'boolean', hidden: true, readOnly: true}),
    defineField({name: 'legacyImage', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [{name: 'recent', title: 'Newest first', by: [{field: 'publishedOn', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'publishedOn', media: 'cover'}},
});
