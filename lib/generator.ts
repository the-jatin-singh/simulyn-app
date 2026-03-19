import { faker } from '@faker-js/faker'
import { generate } from 'json-schema-faker'

function evaluateTemplate(template: any): any {
  if (Array.isArray(template)) {
    return template.map((item) => evaluateTemplate(item))
  }

  if (template !== null && typeof template === 'object') {
    const result: Record<string, any> = {}
    for (const key in template) {
      result[key] = evaluateTemplate(template[key])
    }
    return result
  }

  if (typeof template === 'string') {
    // 1) Deep Faker Object Path parsing (e.g. internet.email, location.city, helpers.arrayElement('a', 'b'))
    const fakerMatch = template.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)(?:\((.*)\))?$/)
    if (fakerMatch) {
      const module = fakerMatch[1]
      const method = fakerMatch[2]
      const argsRaw = fakerMatch[3]

      let parsedArgs: any[] = []
      if (argsRaw) {
        // Safe split by comma handling basic string quotas
        parsedArgs = argsRaw.split(',').map(arg => {
          let trimmed = arg.trim()
          if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed.slice(1, -1)
          }
          if (!isNaN(Number(trimmed))) return Number(trimmed)
          if (trimmed === 'true') return true
          if (trimmed === 'false') return false
          return trimmed
        })
      }

      const fakerModule = (faker as any)[module]
      if (fakerModule && typeof fakerModule[method] === 'function') {
        try {
          if (method === 'arrayElement' || method === 'arrayElements') {
             return fakerModule[method](parsedArgs)
          }
          return fakerModule[method](...parsedArgs)
        } catch(e) {
           // Fallback to strict string if execution fails
           return template
        }
      }
    }

    // 2) Fallback legacy quickwords mappings
    switch (template.toLowerCase()) {
      case 'name':
      case 'fullname': return faker.person.fullName()
      case 'firstname': return faker.person.firstName()
      case 'lastname': return faker.person.lastName()
      case 'email': return faker.internet.email()
      case 'phone': return faker.phone.number()
      case 'number':
      case 'int': return faker.number.int({ max: 1000 })
      case 'uuid': return faker.string.uuid()
      case 'date':
      case 'recentdate': return faker.date.recent()
      case 'boolean': return faker.datatype.boolean()
      case 'word': return faker.word.sample()
      case 'image':
      case 'avatar': return faker.image.avatar()
      case 'city': return faker.location.city()
      case 'country': return faker.location.country()
      case 'company': return faker.company.name()
      case 'jobtitle':
      case 'job': return faker.person.jobTitle()
      case 'lorem':
      case 'paragraph': return faker.lorem.paragraph()
      default: return template
    }
  }

  return template
}

export async function generateData(type: string, config: any, count: number = 1, seed?: number): Promise<any> {
  if (seed) faker.seed(seed)
  else faker.seed() 

  const generateSingleItem = async () => {
    if (type === 'schema') {
      try {
        return await generate(config, {
          useExamplesValue: true,
          alwaysFakeOptionals: true
        })
      } catch (e) {
        return { error: 'Invalid JSON Schema configuration' }
      }
    } else if (type === 'template') {
      return evaluateTemplate(config)
    }
    return null
  }

  if (count > 1) {
    return Promise.all(Array.from({ length: count }).map(() => generateSingleItem()))
  }
  
  return generateSingleItem()
}
