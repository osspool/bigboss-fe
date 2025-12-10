## CMS FE Quick Guide (slug-only)

Two endpoints only, both slug-based. Use the helpers from `docs/.fe/cms-api.ts`.

### Fetch (public)
```ts
import { getCmsPage } from './cms-api';

const { data: page } = await getCmsPage({ slug: 'home' });
if (!page) {
  // show 404 or a placeholder
}
```

### Get or create (admin)
```ts
import { getOrCreateCmsPage } from './cms-api';

const { data: page } = await getOrCreateCmsPage({
  token: adminToken,
  slug: 'about',
  defaults: {
    name: 'About',
    status: 'draft',
    content: { heading: 'About us', body: '' },
  },
});
```

### Update (admin)
```ts
import { updateCmsPage } from './cms-api';

await updateCmsPage({
  token: adminToken,
  slug: 'about',
  data: {
    content: { heading: 'Updated heading', body: 'New body' },
    status: 'published',
  },
});
```

Notes:
- Slugs are the only identifier; FE should keep them in constants.
- Payload type is `CMSPagePayload` in `cms.types.ts` (name, status, content, metadata). Domain-specific content shapes are up to the app.
  }>;
}

export interface ContactPageContent {
  email: string;
  phone: string;
  address: string;
  social?: {
    facebook?: string;
    twitter?: string;
  };
}
```

Then use with type safety:

```typescript
const page = await cmsApi.getBySlug({ slug: 'about-us' });
const content = cmsApi.castContent<AboutPageContent>(page);

// TypeScript knows about these fields
console.log(content?.heading);
console.log(content?.values?.[0].title);
```

## Key Benefits

✅ **No ID tracking** - Work with slugs instead of MongoDB IDs
✅ **Auto-initialization** - Missing pages are created with defaults
✅ **Simplified workflow** - Users only edit content, not create/delete
✅ **Type-safe** - Cast flexible content to specific types
✅ **SEO-friendly** - Slug-based URLs and metadata support
✅ **Flexible content** - JSON structure adapts to your needs

## Common Patterns

### 1. Admin Dashboard - CMS Manager

```typescript
// List all pages with edit buttons
const CMSManager = () => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    cmsApi.getAll({ token }).then(res => setPages(res.docs));
  }, []);

  return (
    <div>
      <h2>CMS Pages</h2>
      {pages.map(page => (
        <div key={page._id}>
          <h3>{page.name}</h3>
          <p>Slug: {page.slug}</p>
          <span>Status: {page.status}</span>
          <button onClick={() => navigate(`/admin/cms/${page.slug}`)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 2. Admin Dashboard - CMS Editor

```typescript
const CMSEditor = ({ slug }) => {
  const [page, setPage] = useState(null);
  const [content, setContent] = useState({});

  useEffect(() => {
    cmsApi.getBySlug({ slug }).then(setPage);
  }, [slug]);

  const handleSave = async () => {
    await cmsApi.updateBySlug({
      token,
      slug,
      data: { content, status: 'published' }
    });
    alert('Saved!');
  };

  return (
    <div>
      <h2>Edit: {page?.name}</h2>
      <JsonEditor value={content} onChange={setContent} />
      <button onClick={handleSave}>Save & Publish</button>
    </div>
  );
};
```

### 3. Frontend - Dynamic Page Loader

```typescript
// app/[slug]/page.tsx (Next.js)
export default async function DynamicPage({ params }) {
  const page = await cmsApi.getBySlug({
    slug: params.slug
  });

  if (!page || page.status !== 'published') {
    notFound();
  }

  return <PageRenderer page={page} />;
}
```

## Notes

- Pages are **public readable** (no auth needed for `getBySlug`, `getAll`)
- Only **admins can create/update/delete** pages
- `publishedAt` is **auto-set** when status changes to "published"
- Content field is **flexible** - any JSON structure works
- **5-minute cache** on public reads for better performance
