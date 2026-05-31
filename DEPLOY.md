# Deploy MVP

Arquitectura elegida:

- Frontend React/Vite en Vercel.
- API Fastify en Render Free.
- PostgreSQL + PostGIS en Supabase.
- Imagenes de propiedades en Supabase Storage.

## Supabase

### 1. Proyecto

Proyecto creado:

```text
https://cqbjsrwizzibmqeelfny.supabase.co
```

### 2. Connection string

En Supabase:

1. Ir a `Connect`.
2. Copiar la `Direct connection string` o la connection string recomendada para server apps.
3. Reemplazar `[YOUR-PASSWORD]` por la password real de la base.
4. Guardarla como `DEPLOY_DATABASE_URL`.

Ejemplo:

```text
DEPLOY_DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

### 3. API keys

En Supabase:

1. Ir a `Project Settings`.
2. Entrar a `API Keys`.
3. Copiar la `service_role` key.
4. Guardarla como `SUPABASE_SERVICE_ROLE_KEY`.

No usar la `service_role` key en Vercel ni en codigo frontend.

### 4. Storage

En Supabase:

1. Ir a `Storage`.
2. Crear un bucket llamado:

```text
property-images
```

3. Marcarlo como `Public`.
4. Guardar este nombre como:

```text
SUPABASE_STORAGE_BUCKET=property-images
```

### 5. Tablas y extensiones

Opcion recomendada para MVP: correr el script remoto desde tu maquina:

```bash
npm run db:setup:supabase
```

Ese script:

- Usa `DEPLOY_DATABASE_URL`.
- Corre los SQL de `src/database/schemas` en orden.
- Saltea `000-create-app-user.sql`, porque ese archivo es para Docker local.

Si preferis hacerlo manual en SQL Editor, correr desde `001-extensions.sql` hasta `022-add-postgis-coordinates.sql` en orden.

PostGIS queda habilitado con:

```sql
create extension if not exists postgis;
```

### 6. GitHub integration de Supabase

Para esta MVP no dependemos de esa integracion.

El repo hoy guarda los SQL en:

```text
src/database/schemas
```

La integracion de Supabase espera una carpeta `supabase/` con migraciones propias. Mas adelante podemos migrar a `supabase/migrations`; por ahora es mas seguro correr `npm run db:setup:supabase`.

## Render API

### Opcion A: Blueprint recomendado

El repo ya incluye:

```text
render.yaml
```

En Render:

1. Ir a `New`.
2. Elegir `Blueprint`.
3. Conectar el repo `Propie-RealState/Propie`.
4. Render va a detectar `render.yaml`.
5. Crear el servicio `propie-api`.
6. Completar las variables marcadas como `sync: false`.

Variables a completar:

```text
DEPLOY_DATABASE_URL=<connection string de Supabase>
DEPLOY_FRONTEND_ORIGIN=https://<app>.vercel.app
SUPABASE_URL=https://cqbjsrwizzibmqeelfny.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key de Supabase>
```

Render genera automaticamente:

```text
DEPLOY_JWT_SECRET
DEPLOY_JWT_REFRESH_SECRET
```

Y deja configuradas desde `render.yaml`:

```text
NODE_ENV=production
DEPLOY_DB_SSL=true
SUPABASE_STORAGE_BUCKET=property-images
```

### Opcion B: Web Service manual

Crear un Web Service conectado al repo con:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Plan: Free
- Root directory: dejar vacio, porque la API vive en la raiz del repo

Variables:

```text
NODE_ENV=production
DEPLOY_DATABASE_URL=<supabase transaction/direct connection string>
DEPLOY_DB_SSL=true
DEPLOY_FRONTEND_ORIGIN=https://<app>.vercel.app
DEPLOY_JWT_SECRET=<secret largo>
DEPLOY_JWT_REFRESH_SECRET=<secret largo distinto>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
SUPABASE_STORAGE_BUCKET=property-images
```

### Despues del primer deploy

1. Copiar la URL de Render, por ejemplo:

```text
https://propie-api.onrender.com
```

2. Usarla en Vercel como:

```text
VITE_API_URL=https://propie-api.onrender.com
```

3. Cuando Vercel entregue la URL final, volver a Render y confirmar:

```text
DEPLOY_FRONTEND_ORIGIN=https://<app>.vercel.app
```

4. Redeployar Render si cambiaste `DEPLOY_FRONTEND_ORIGIN`.

## Vercel Frontend

Crear el proyecto apuntando al directorio `web`.

- Build command: `pnpm build`
- Output directory: `dist`

Variable:

```text
VITE_API_URL=https://<api>.onrender.com
```

Cuando Render entregue la URL final, actualizar `DEPLOY_FRONTEND_ORIGIN` en Render con la URL de Vercel y redeployar.
