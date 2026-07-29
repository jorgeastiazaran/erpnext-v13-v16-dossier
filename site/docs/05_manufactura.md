# Guía de Migración: Módulo de Manufactura (Manufacturing)
## ERPNext v13 → v16

---

## Índice
1. [Resumen de Cambios](#1-resumen-de-cambios)
2. [Cambios Detallados por Versión](#2-cambios-detallados-por-versión)
3. [Nuevas Funcionalidades](#3-nuevas-funcionalidades)
4. [Cambios Rompientes y Acciones Requeridas](#4-cambios-rompientes-y-acciones-requeridas)
5. [Cambios en la Interfaz de Usuario](#5-cambios-en-la-interfaz-de-usuario)
6. [Pruebas de Validación (UAT)](#6-pruebas-de-validación-uat)

---

## 1. Resumen de Cambios

El módulo de Manufactura experimentó cambios profundos en la estructura de BOMs, operaciones y subcontratación.

| Área | Cambio | Impacto |
|------|--------|---------|
| Subcontratación | **Subcontracting Order removido** → movido a Compras | 🔴 Alto |
| BOM | **BOM Versioning** formal (v14) | 🟡 Medio |
| Operaciones | **Routing** como maestro reutilizable (v15) | 🟡 Medio |
| BOM Fantasma | **Phantom BOM** nativo (v16) | 🟡 Medio |
| Shop Floor | **Interfaz de piso de producción** (v16) | 🟡 Medio |
| Desperdicio | **Scrap Items** en Job Cards (v14) | 🟢 Bajo |
| Tiempos muertos | **Downtime Entry** para registrar paros (v14) | 🟢 Bajo |
| Trazabilidad | Trazabilidad de series/lotes en manufactura (v16) | 🟡 Medio |
| Stock | Reserva de stock para Work Orders (v16) | 🟡 Medio |
| MRP | Flujo MRP dedicado con forecasts (v16) | 🟡 Medio |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) BOM Versioning (Versionamiento de Listas de Materiales)
- Cada BOM ahora tiene un **número de versión** formal
- Al modificar una BOM, se debe crear una nueva versión
- Las Órdenes de Trabajo y Planes de Producción referencian una versión específica
- Las versiones anteriores se mantienen para rastreo histórico
- **Impacto en MRP:** El sistema planifica usando la versión activa de la BOM

#### b) Scrap Items (Artículos de Desperdicio)
- Las Job Cards ahora soportan la generación de **artículos de desperdicio**
- Se puede definir el desperdicio esperado por operación
- Al completar una Job Card, el sistema registra el ingreso de scrap al almacén de desperdicio
- Afecta el cálculo de costo: el desperdicio reduce el costo unitario del producto terminado

#### c) Process Loss (Pérdida de Proceso)
- Nuevo concepto de **pérdida de proceso** en la BOM
- Define el porcentaje de pérdida esperado durante la fabricación
- El sistema calcula la cantidad de materia prima necesaria considerando la pérdida
- Ejemplo: Si la pérdida es 5%, para producir 100 unidades se planifican materiales para 105

#### d) Downtime Entry (Registro de Tiempos Muertos)
- Nuevo doctype para registrar paros de máquina/estación de trabajo
- Campos: Estación, Motivo, Hora inicio/fin, Duración
- Se vincula al **Asset** (equipo) para tracking de mantenimiento
- Reportes de disponibilidad y OEE (Eficiencia Global de Equipos)

#### e) Mejoras en Production Plan (Plan de Producción)
- Agregación de subensambles para sub-artículos
- Reporte de resumen del Plan de Producción
- Soporte para planificación de múltiples artículos en un solo plan

#### f) Work Order Improvements
- Capacidad de **cerrar** Work Orders (antes solo se podían cancelar)
- Validación de fechas: Fecha de Fin Planeada no puede ser anterior a Fecha de Inicio
- **Partial Material Transfer**: transferencia parcial de materias primas a producción
- **Partial Finished Good Entry**: registro parcial de producto terminado

#### g) Work Order Consumed Materials Report
- Nuevo reporte que muestra los materiales realmente consumidos vs planificados

### 2.2 Cambios en v15 (desde v14)

#### a) Routing (Hoja de Ruta) ⭐
- Nuevo doctype **Routing** como maestro reutilizable de secuencias de operaciones
- Define: operaciones, estaciones de trabajo, tiempos estándar, secuencia
- Se vincula a la BOM en lugar de definir operaciones directamente en la BOM

| Aspecto | Antes (v13) | Después (v15+) |
|---------|-------------|----------------|
| Operaciones | Definidas directamente en la tabla de operaciones de la BOM | Definidas en un **Routing** separado, vinculado a la BOM |
| Reutilización | Cada BOM tenía sus propias operaciones | Un Routing se reutiliza en múltiples BOMs |
| Job Cards | Se creaban basándose en las operaciones de la BOM | Se crean basándose en las operaciones del Routing |
| Cambios | Cambiar operaciones requería editar cada BOM | Cambiar el Routing afecta todas las BOMs vinculadas |

#### b) Subcontratación Removida de Manufactura
- El doctype **Subcontracting Order** fue removido de Manufactura
- Toda la subcontratación se maneja ahora desde el módulo de **Compras** (Purchase Order tipo "Subcontracting")
- El Production Plan ya no genera Subcontracting Orders; en su lugar genera Purchase Orders
- Ver detalles en la [Guía de Compras](./04_compras.md#31-subcontratación-nuevo-flujo)

#### c) Multi-level BOM Creator
- Herramienta visual de árbol para crear y gestionar BOMs multinivel
- Permite ver y editar toda la estructura de la BOM (ensambles, subensambles, materias primas) en una sola vista

#### d) Mejoras en Job Card
- Las Job Cards ahora siguen la secuencia del Routing
- Una operación no puede comenzar hasta que la anterior se complete (si la secuencia lo requiere)
- Soporte para registro de tiempo por empleado

### 2.3 Cambios en v16 (desde v15)

#### a) Phantom BOM (BOM Fantasma) ⭐
- Soporte nativo para BOMs de artículos que no se fabrican ni almacenan por separado
- **¿Qué es?** Un "ensamble fantasma" que agrupa materias primas pero no requiere una orden de producción separada
- **Funcionamiento:** Al crear un Work Order, el sistema "explota" los Phantom BOMs y muestra directamente las materias primas subyacentes
- **Ejemplo:** 
  - Producto: Mesa de madera
  - Phantom BOM: "Kit de Patas" (4 patas + 16 tornillos)
  - Al crear el Work Order, el sistema muestra directamente las patas y tornillos, sin crear un WO separado para el kit

#### b) Shop Floor Interface (Interfaz de Piso de Producción) ⭐
- Nueva página de Desk diseñada para operadores en piso de producción
- Interfaz touch-friendly para tablets y pantallas grandes
- Funcionalidades:
  - Ver Job Cards asignadas al operador
  - Iniciar/pausar/completar operaciones con un botón
  - Registrar tiempo automáticamente
  - Ingresar lecturas de calidad
  - Escanear código de barras de empleado para login
  - Ver estado de estaciones de trabajo

#### c) Serial and Batch Traceability en Manufactura
- Los productos terminados con serie/lote ahora se rastrean completamente desde las materias primas
- El reporte de trazabilidad permite:
  - Ver qué lotes de materia prima se usaron en un lote de producto terminado
  - Rastrear desde un lote de materia prima hasta los productos terminados que lo contienen

#### d) Stock Reservation para Work Orders
- Las materias primas pueden **reservarse** para un Work Order específico
- Evita que otras órdenes o ventas consuman materiales ya asignados a producción
- Se configura desde el Work Order con el botón **Reserve Stock**

#### e) MRP Workflow (Material Requirements Planning)
- Flujo dedicado de MRP que integra:
  - Pronósticos de demanda
  - Programas de entrega
  - Lead times de proveedores
  - Stock de seguridad
- Genera automáticamente Material Requests y Purchase Orders basados en la planificación

#### f) Item-wise Accounting en Manufactura
- Las cuentas de inventario y COGS pueden configurarse a nivel de artículo individual
- Permite un seguimiento financiero más preciso del costo de manufactura

---

## 3. Nuevas Funcionalidades

### 3.1 Phantom BOM

**Configuración:**
1. Crear un artículo que represente el ensamble fantasma (ej: "Kit de Patas")
2. Marcar el artículo como **"Is Phantom = Yes"** (o similar, según la versión)
3. Crear una **BOM** para el artículo fantasma con sus componentes
4. En la BOM del producto final, incluir el artículo fantasma como componente

**Resultado:**
- Al crear un Work Order para el producto final, el sistema explota el Phantom BOM
- Los materiales del kit aparecen directamente en la lista de materias primas del Work Order
- No se crea un Work Order separado para el artículo fantasma

### 3.2 Routing

**Configuración:**
1. Ir a **Manufactura → Routing → Nuevo**
2. Definir la secuencia de operaciones:
   - Operación 1: Corte → Estación: Sierra → Tiempo: 30 min
   - Operación 2: Ensamble → Estación: Mesa de ensamble → Tiempo: 45 min
   - Operación 3: Acabado → Estación: Pintura → Tiempo: 20 min
3. Guardar el Routing

**Vincular a BOM:**
1. Abrir o crear una **BOM**
2. En el campo **Routing**, seleccionar el Routing creado
3. Las operaciones se cargan automáticamente desde el Routing
4. Al crear un Work Order con esta BOM, se generan Job Cards según la secuencia del Routing

### 3.3 Shop Floor

**Acceso:**
1. Ir a **Manufactura → Shop Floor** (o buscar "Shop Floor")
2. La interfaz muestra:
   - Lista de Job Cards activas
   - Estado de estaciones de trabajo
   - Capacidad y disponibilidad

**Uso por operadores:**
1. El operador escanea su credencial o selecciona su nombre
2. Ve sus Job Cards asignadas
3. Hace clic en **Start** para iniciar una operación
4. El cronómetro comienza automáticamente
5. Si hay lecturas de calidad, las ingresa en la interfaz
6. Al terminar, hace clic en **Complete**
7. El tiempo se registra en la Job Card

### 3.4 BOM Versioning

**Flujo:**
1. Abrir una BOM existente
2. Para hacer cambios, hacer clic en **Create New Version**
3. Se crea una copia editable de la BOM con versión incrementada
4. Realizar los cambios necesarios (materiales, cantidades, operaciones)
5. Guardar y activar la nueva versión
6. La versión anterior se mantiene como referencia
7. Los Work Orders nuevos usan la versión activa
8. Los Work Orders existentes mantienen su versión original

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Subcontracting Order Removido

> ⚠️ **Acción crítica antes de la migración**

| Acción | Descripción |
|--------|-------------|
| **Cerrar órdenes abiertas** | Todas las Subcontracting Orders pendientes deben cerrarse o completarse antes de migrar |
| **Documentar flujos** | Documentar el flujo actual de subcontratación para recrearlo con Purchase Orders |
| **Actualizar scripts** | Reescribir scripts que referencien `Subcontracting Order` |
| **Actualizar reportes** | Actualizar reportes personalizados de subcontratación |
| **Capacitar usuarios** | Los usuarios de subcontratación ahora deben usar el módulo de Compras |

### 4.2 Routing vs BOM Operations

| Aspecto | Impacto | Acción Requerida |
|---------|---------|-----------------|
| BOMs con operaciones | Las operaciones directas en la BOM siguen funcionando pero están deprecadas | Crear Routings y vincularlos a las BOMs |
| Job Card creation | El sistema prioriza el Routing sobre las operaciones de la BOM | Verificar que las Job Cards se generan correctamente |
| Reportes de tiempo | Reportes basados en operaciones de BOM pueden dar resultados diferentes | Actualizar reportes para considerar Routings |

### 4.3 BOM Versioning

- Si tenían integraciones que asumían una sola BOM por artículo, ahora deben manejar versiones
- El campo `bom_version` es importante para MRP y Production Plan
- Las integraciones deben solicitar la versión activa: `frappe.get_value("BOM", {"item": item, "is_active": 1}, "name")`

### 4.4 Serial and Batch Bundle en Manufactura

- Los Stock Entries de tipo "Manufacture" ahora usan Serial and Batch Bundle
- Scripts que generan Stock Entries con números de serie/lote como texto deben actualizarse

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 BOM
- Vista de árbol mejorada con drag-and-drop para reorganizar componentes
- Indicador visual de versiones disponibles
- Link directo al Routing vinculado

### 5.2 Work Order
- Timeline tipo Gantt con las operaciones del Routing
- Indicadores de progreso por operación
- Botón de **Reserve Stock** para reservar materias primas
- Indicador de materiales transferidos vs pendientes

### 5.3 Job Card
- Interfaz simplificada para operadores
- Botones de Start/Pause/Complete prominentes
- Sección de scrap items visible
- Timer integrado para registro de tiempo

### 5.4 Production Plan
- Asistente paso a paso: seleccionar artículos → calcular materiales → generar órdenes
- Vista consolidada de requerimientos por artículo y por almacén
- Integración con MRP para planificación automática

### 5.5 Shop Floor (Nuevo)
- Página dedicada para operadores de piso
- Touch-friendly para tablets
- Vista de estados de estaciones de trabajo

---

## 6. Pruebas de Validación (UAT)

---

### UAT-MAN-01: Crear BOM con Versionamiento

**Objetivo:** Verificar la creación y versionamiento de BOMs.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **BOM** para un producto terminado | BOM creada con versión 1 |
| 2 | Agregar materias primas con cantidades | Los materiales se listan correctamente |
| 3 | Guardar y marcar como predeterminada | BOM activa como default |
| 4 | Crear una **nueva versión** de la BOM | Se crea una copia con versión 2 |
| 5 | Modificar una cantidad y guardar | La versión 2 tiene el cambio |
| 6 | Verificar que la versión 1 permanece sin cambios | Versión 1 intacta |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-02: Crear y Vincular Routing

**Objetivo:** Verificar el uso de Routings en manufactura.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Routing** con 3 operaciones | Routing creado |
| 2 | Definir estaciones de trabajo y tiempos para cada operación | Datos configurados |
| 3 | Vincular el Routing a una BOM | La BOM muestra las operaciones del Routing |
| 4 | Crear un **Work Order** con esa BOM | WO creado |
| 5 | Verificar que se generan **3 Job Cards** según el Routing | Las Job Cards existen con las operaciones correctas |
| 6 | Verificar la secuencia de las Job Cards | La secuencia coincide con el Routing |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-03: Work Order Completo

**Objetivo:** Verificar el flujo completo de una Orden de Trabajo.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Work Order** para producir 50 unidades | WO creado |
| 2 | Enviar el Work Order | Estado: In Process |
| 3 | Hacer clic en **Transfer Raw Materials** | Se genera Stock Entry de transferencia |
| 4 | Enviar el Stock Entry | Materias primas se transfieren a WIP warehouse |
| 5 | Completar las Job Cards (iniciar → completar) | Job Cards completadas |
| 6 | Hacer clic en **Make Stock Entry → Manufacture** | Stock Entry de manufactura creado |
| 7 | Enviar el Stock Entry de manufactura | Producto terminado ingresa al almacén |
| 8 | Verificar stock de materias primas (reducido) y PT (incrementado) | Cantidades correctas |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-04: Phantom BOM (v16)

**Objetivo:** Verificar que los Phantom BOMs se explotan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un artículo fantasma (ej: "Kit de Componentes") | Artículo creado como Phantom |
| 2 | Crear una BOM para el artículo fantasma | BOM del kit con sus componentes |
| 3 | Crear la BOM del producto final incluyendo el artículo fantasma | BOM del producto con el kit |
| 4 | Crear un **Work Order** para el producto final | WO creado |
| 5 | Verificar que los materiales del kit aparecen **directamente** | Los componentes del kit se listan como materias primas |
| 6 | Verificar que **no** se creó un WO separado para el kit | Solo existe el WO del producto final |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-05: Job Cards con Scrap Items

**Objetivo:** Verificar el registro de desperdicio en Job Cards.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar una BOM con **Scrap Items** definidos | BOM con scrap |
| 2 | Crear un Work Order y las Job Cards | JCs creadas |
| 3 | Completar una Job Card y registrar cantidad de scrap | El scrap se registra |
| 4 | Verificar que el Stock Entry incluye el scrap | El scrap ingresa al almacén de desperdicio |
| 5 | Verificar el costo del producto terminado | El costo no incluye el valor del scrap |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-06: Process Loss (Pérdida de Proceso)

**Objetivo:** Verificar que la pérdida de proceso se calcula correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una BOM con **Process Loss = 5%** | BOM con pérdida configurada |
| 2 | Crear un Work Order por 100 unidades | WO creado |
| 3 | Verificar la cantidad de materias primas planificada | Materiales planificados para 105 unidades (100 + 5% pérdida) |
| 4 | Completar la producción con 95 unidades de salida | Se puede registrar menos del 100% |
| 5 | Verificar que la pérdida se registra correctamente | La diferencia se contabiliza como pérdida |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-07: Production Plan

**Objetivo:** Verificar el Plan de Producción con generación automática de órdenes.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Production Plan** | Plan creado |
| 2 | Agregar artículos a producir con cantidades | Artículos listados |
| 3 | Hacer clic en **Get Raw Materials** | Se calculan los materiales necesarios |
| 4 | Verificar que se consideran subensambles | Los multiniveles se planifican correctamente |
| 5 | Hacer clic en **Make Work Orders** | Se generan los Work Orders |
| 6 | Hacer clic en **Make Material Requests** | Se generan solicitudes de material |
| 7 | Verificar que los Work Orders son correctos | Cantidades y BOMs correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-08: Shop Floor Interface (v16)

**Objetivo:** Verificar la interfaz de piso de producción.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear Work Orders con Job Cards pendientes | Datos disponibles |
| 2 | Abrir la interfaz de **Shop Floor** | La interfaz se carga correctamente |
| 3 | Verificar que las Job Cards pendientes se muestran | Las JCs aparecen |
| 4 | Iniciar una operación desde la interfaz | El timer comienza |
| 5 | Completar la operación | El tiempo se registra en la Job Card |
| 6 | Verificar que el estado de la estación de trabajo se actualiza | La estación refleja disponibilidad |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-09: Stock Reservation para Work Orders (v16)

**Objetivo:** Verificar la reserva de materiales para producción.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un Work Order | WO creado |
| 2 | Hacer clic en **Reserve Stock** | Las materias primas se reservan |
| 3 | Verificar que el stock disponible (no reservado) se redujo | Stock disponible = Total - Reservado |
| 4 | Intentar crear otro WO que requiera los mismos materiales | El sistema advierte sobre materiales insuficientes |
| 5 | Completar el primer WO | La reserva se consume |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-10: Downtime Entry

**Objetivo:** Verificar el registro de tiempos muertos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Downtime Entry** para una estación de trabajo | Formulario abierto |
| 2 | Registrar: estación, motivo, hora inicio, hora fin | Datos capturados |
| 3 | Enviar el registro | Tiempo muerto registrado |
| 4 | Verificar en reportes de producción | El downtime se refleja en el análisis |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MAN-11: Trazabilidad en Manufactura (v16)

**Objetivo:** Verificar la trazabilidad de series/lotes en producción.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Producir un artículo con serie/lote usando materias primas con lote | Producción completada |
| 2 | Abrir el reporte de **Serial and Batch Traceability** | Reporte disponible |
| 3 | Buscar el lote del producto terminado | Se muestra la cadena de producción |
| 4 | Verificar trazabilidad hacia atrás (PT → MP) | Los lotes de MP se identifican |
| 5 | Verificar trazabilidad hacia adelante (MP → PT) | Los productos que usaron ese lote se listan |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Manufactura — Dossier de Migración ERPNext v13 → v16*
