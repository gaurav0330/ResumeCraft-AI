# LaTeX Section Extraction Feature - ResumeCraft AI

## Overview
This implementation adds automatic extraction and storage of LaTeX resume sections into the database. Whenever a user submits LaTeX code or uploads a `.tex` file, the system automatically parses the document, extracts different sections (Contact Information, Professional Summary, Education, etc.), and stores them as separate entities that can be updated without creating new rows.

## What Was Implemented

### 1. Database Schema Updates

#### New Model: `ResumeSection`
- `id`: Auto-incrementing primary key
- `resumeId`: Foreign key to Resume (with cascade delete)
- `sectionName`: Name of the section (e.g., "Contact Information", "Education")
- `content`: The extracted content from that section
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### Updated Model: `Resume`
- Now includes a `sections` relation to `ResumeSection[]`
- When a resume is deleted, all its sections are automatically deleted (cascade)

### 2. LaTeX Parser Utility (`server/src/utils/latexParser.js`)

Created a comprehensive LaTeX parser that extracts the following sections:

#### Supported Sections:
1. **Contact Information** - Email, phone, LinkedIn, GitHub
2. **Professional Summary** - Summary or objective
3. **Technical Skills** - Programming languages, frameworks, tools
4. **Professional Experience** - Work history
5. **Work Experience** - Alternative naming for work history
6. **Education** - Educational background
7. **Projects** - Project portfolio
8. **Certifications** - Professional certifications
9. **Awards** - Honors and awards
10. **Languages** - Spoken languages
11. **Publications** - Research papers or publications
12. **Volunteer Experience** - Volunteer work

#### Features:
- **Pattern Matching**: Uses regex patterns to find sections
- **Raw LaTeX Storage**: Stores the complete, unmodified LaTeX code for each section (preserves all commands and formatting)
- **Smart Extraction**: Handles multiple naming conventions (e.g., "Professional Experience" vs "Work Experience")
- **Validation**: Includes `isValidLatexResume()` function to validate LaTeX structure

#### Example Usage:
```javascript
import { extractLatexSections } from '../utils/latexParser.js';

const latexCode = `\section*{Contact Information}\n...`;
const sections = extractLatexSections(latexCode);
// Returns: [{ sectionName: "Contact Information", content: "..." }, ...]
```

### 3. GraphQL Schema Updates

#### New Type: `ResumeSection`
```graphql
type ResumeSection {
  id: ID!
  sectionName: String!
  content: String!
  createdAt: String
  updatedAt: String
}
```

#### Updated Type: `Resume`
```graphql
type Resume {
  id: ID!
  title: String!
  latexCode: String
  fileUrl: String
  fileType: String
  sections: [ResumeSection!]!  # NEW
  createdAt: String
  updatedAt: String
}
```

### 4. Resolver Updates (`server/src/graphql/resolvers/resume.resolver.js`)

The resolver now:
1. **Extracts sections** when LaTeX code is provided
2. **Updates sections** (deletes old and creates new) when a resume is updated
3. **Returns sections** with every resume query
4. **Avoids duplicates** by checking if same content is being uploaded

#### Key Logic:
```javascript
// When creating/updating a resume with LaTeX code:
const sections = extractLatexSections(latexCode);

// Delete existing sections
await prisma.resumeSection.deleteMany({
  where: { resumeId: existingResume.id }
});

// Create new sections
await prisma.resumeSection.createMany({
  data: sections.map(section => ({
    resumeId: existingResume.id,
    sectionName: section.sectionName,
    content: section.content
  }))
});
```

### 5. Client-Side Updates

#### TypeScript Types (`client/src/types/graphql.ts`)
```typescript
export interface ResumeSection {
  id: string;
  sectionName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  // ... existing fields
  sections?: ResumeSection[];  // NEW
}
```

#### GraphQL Queries Updated
- `GET_USER_RESUMES_QUERY` now includes sections
- `UPLOAD_RESUME_MUTATION` now returns sections

## How It Works

### Workflow:
1. **User uploads LaTeX file or pastes LaTeX code**
2. **System checks if user already has a resume**
   - If yes: Updates existing resume and **replaces all sections**
   - If no: Creates new resume and **creates new sections**
3. **LaTeX parser extracts sections** from the LaTeX code
4. **Sections are stored in database** with links to the resume
5. **Resume is returned** with all sections included

### Key Features:
- ✅ **No duplicate rows**: Updates existing sections instead of creating new ones
- ✅ **Automatic extraction**: No manual configuration needed
- ✅ **Raw LaTeX storage**: Stores complete LaTeX code for each section (with all commands intact)
- ✅ **Multiple section support**: Handles various resume section types
- ✅ **Cascade deletion**: Deleting a resume deletes all its sections

## Database Migration

The migration creates:
- New `ResumeSection` table
- Foreign key relationship to `Resume` table
- Cascade delete constraint

Run with:
```bash
cd server
npx prisma migrate dev --name add_resume_sections
```

## Usage Examples

### Querying Resume with Sections
```graphql
query {
  getUserResumes(userId: "1") {
    id
    title
    latexCode
    sections {
      sectionName
      content
    }
  }
}
```

### Response Structure
```json
{
  "getUserResumes": [
    {
      "id": "1",
      "title": "Software Engineer Resume",
      "latexCode": "...",
      "sections": [
        {
          "sectionName": "Contact Information",
          "content": "Email: john@email.com\nPhone: 123-456-7890"
        },
        {
          "sectionName": "Professional Summary",
          "content": "Experienced software engineer..."
        },
        {
          "sectionName": "Education",
          "content": "BS in Computer Science..."
        }
      ]
    }
  ]
}
```

## Benefits

1. **Structured Data**: Resume sections are now stored in a structured, queryable format
2. **Easy Updates**: No need to create new rows - existing sections are updated
3. **Section-Based Queries**: Can query specific sections without parsing LaTeX
4. **Better AI Processing**: Individual sections can be processed separately for tailoring
5. **Scalable**: Easy to add more section types in the future

## Next Steps (Optional Enhancements)

1. **Section-specific AI tailoring**: Use sections to tailor specific parts of resume
2. **Section comparison**: Compare sections across different resumes
3. **Section templates**: Pre-defined section templates for common resume formats
4. **Section validation**: Validate that all required sections exist
5. **Export by sections**: Export only specific sections

## Testing

To test the feature:
1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm run dev`
3. Upload a `.tex` file or paste LaTeX code
4. Check the database for `ResumeSection` entries
5. Query through GraphQL to see sections returned

## Files Modified

1. `server/prisma/schema.prisma` - Added ResumeSection model
2. `server/src/utils/latexParser.js` - Created parser utility
3. `server/src/graphql/schema/resume.graphql` - Added ResumeSection type
4. `server/src/graphql/resolvers/resume.resolver.js` - Updated to extract and store sections
5. `client/src/types/graphql.ts` - Added ResumeSection interface
6. `client/src/graphql/queries/resume.ts` - Added sections to query
7. `client/src/graphql/mutations/resume.ts` - Added sections to mutation

## Error Handling

- Invalid LaTeX: Parser gracefully handles missing sections
- Empty sections: Sections with no content are not stored
- Duplicate sections: Only one entry per section name per resume
- Migration safety: Old resumes without sections still work

