# Guía de Migración: Módulo de Inventario / Stock
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

El módulo de Inventario/Stock experimentó cambios profundos, especialmente en el manejo de números de serie y lotes, reserva de stock y dimensiones de inventario.

| Área | Cambio | Impacto |
|------|--------|---------|
| Series y Lotes | **Serial and Batch Bundle** reemplaza campos de texto | 🔴 Alto |
| Picking | **Pick List** formalizado para preparación de pedidos | 🟡 Medio |
| Reserva | **Stock Reservation** contra Órdenes de Venta | 🟡 Medio |
| Reglas de almacén | **Putaway Rule** para dirigir stock entrante | 🟢 Bajo |
| Dimensiones | **Inventory Dimensions** personalizables | 🔴 Alto |
| Transferencias | **Inter Company Stock Transfer** entre empresas | 🟡 Medio |
| Valuación | Soporte para **LIFO** y valuación por lote | 🟡 Medio |
| Trazabilidad | Reporte de trazabilidad de series/lotes (v16) | 🟡 Medio |
| Revaluación | Reposteo de Stock Ledger mejorado (background) | 🟢 Bajo |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Pick List (Lista de Preparación)
- Nuevo doctype formal **Pick List** para preparar pedidos desde el almacén
- Se puede crear desde una **Orden de Venta** o **Solicitud de Material**
- El sistema sugiere qué artículos tomar de qué ubicación (bin) según disponibilidad
- Desde el Pick List se genera la **Nota de Entrega** automáticamente
- Soporta escaneo de código de barras para validación de picking

#### b) Inter Company Stock Transfer
- Nuevo doctype para transferencias de stock entre empresas del mismo grupo
- Crea automáticamente Stock Entries vinculadas en ambas empresas (salida + entrada)
- Manejo automático de valuación entre empresas

#### c) Valuación LIFO
- Soporte para método de valuación **LIFO** (Último en Entrar, Primero en Salir)
- Se configura a nivel de Item o Warehouse
- Complementa los métodos existentes: FIFO, Moving Average, Specific Value

#### d) Valuación por Lote
- Las tasas de valuación ahora pueden calcularse por lote específico
- Útil para industrias donde cada lote tiene un costo diferente (farmacéutica, alimentaria)

#### e) Mejoras en Código de Barras
- Soporte para **códigos de barras específicos por UOM** (unidad de medida)
- Escanear el código de barras aplica automáticamente la UOM correcta
- Mejoras en el escáner de Pick List

#### f) Tolerancia de Sobre-transferencia
- Nueva configuración de **Over Transfer Allowance** para transferencias de material
- Permite una tolerancia porcentual al transferir materiales a producción

### 2.2 Cambios en v15 (desde v14)

#### a) Serial and Batch Bundle ⭐
- **Cambio más significativo del módulo de inventario**
- Reemplaza los campos de texto libre para series y lotes con un doctype estructurado
- Cada transacción (Stock Entry, Delivery Note, Purchase Receipt, etc.) ahora vincula un **Serial and Batch Bundle** en lugar de tener campos de texto con números de serie/lote

| Aspecto | Antes (v13) | Después (v15+) |
|---------|-------------|----------------|
| Campo de serie | Textarea con números separados por línea | Link a Serial and Batch Bundle |
| Campo de lote | Campo de texto simple | Link a Serial and Batch Bundle |
| Integridad de datos | Propenso a errores de formato | Validado por doctype |
| Consulta de datos | Buscar en campo texto | Consulta relacional |

#### b) Stock Reservation (Reserva de Stock)
- Permite **reservar** cantidades de inventario contra Órdenes de Venta
- Evita la sobre-venta: el stock reservado no está disponible para otros pedidos
- Se activa desde la Orden de Venta con el botón **Reserve Stock**
- Un trabajo en segundo plano crea **Stock Reservation Entries**
- Al cancelar la orden, las reservaciones se liberan automáticamente

#### c) Putaway Rule (Regla de Ubicación)
- Nuevo doctype para dirigir automáticamente el stock entrante a ubicaciones específicas
- Configurable por: artículo, grupo de artículos, capacidad de almacén, zona
- Se aplica automáticamente en Purchase Receipt y Stock Entry tipo "Material Receipt"
- Ejemplo: "Artículos refrigerados → Almacén Frío, Sección A-1"

#### d) Reposteo de Stock Ledger Mejorado
- Cuando se hace una entrada con fecha retroactiva, el sistema ahora **repostea automáticamente** todas las entradas futuras en segundo plano
- Antes (v13): el reposteo era inmediato y podía causar timeouts
- Después (v15+): el reposteo se ejecuta como tarea de fondo, mejorando la experiencia del usuario

### 2.3 Cambios en v16 (desde v15)

#### a) Inventory Dimensions (Dimensiones de Inventario) ⭐
- Similar a las Dimensiones Contables pero para inventario
- Permite definir campos personalizados (Proyecto, Sucursal, Línea de negocio) como dimensiones de seguimiento de inventario
- Cada movimiento de stock registra los valores de las dimensiones
- El **Stock Ledger Entry** ahora incluye columnas para cada dimensión
- Stock Balance, Stock Reconciliation y Putaway Rules son compatibles con dimensiones

#### b) Serial and Batch Traceability Report
- Nuevo reporte de trazabilidad completa para series y lotes
- **Trazabilidad hacia adelante:** Desde materia prima → producto terminado → cliente
- **Trazabilidad hacia atrás:** Desde producto terminado → materias primas y lotes utilizados
- Diseñado para cumplimiento regulatorio (ISO, FDA, HACCP)

#### c) Stock Reservation para Work Orders
- Extensión de la funcionalidad de reserva para incluir Órdenes de Manufactura
- Se pueden "reservar" materias primas específicas para una Orden de Trabajo
- Previene conflictos de inventario cuando múltiples órdenes compiten por los mismos materiales

#### d) FEFO Picking Strategy
- Soporte para estrategia **FEFO** (First Expired, First Out) en la preparación de pedidos
- El Pick List sugiere primero los lotes con fecha de caducidad más próxima
- Alertas de lotes próximos a vencer

#### e) Contabilidad Item-wise
- Se pueden configurar cuentas de inventario y COGS (Costo de Ventas) a nivel de artículo individual
- Antes: la cuenta de inventario estaba definida solo a nivel de almacén
- Permite un seguimiento financiero más preciso por artículo

---

## 3. Nuevas Funcionalidades

### 3.1 Serial and Batch Bundle

**¿Qué es?** Un documento estructurado que contiene la lista de números de serie y/o lotes para una transacción de inventario.

**Cómo funciona:**
1. Al crear una Nota de Entrega, Recibo de Compra, o Stock Entry con artículos serializados/por lotes
2. En la tabla de artículos, en lugar de escribir números en un campo de texto, se crea un **Serial and Batch Bundle**
3. El Bundle contiene una tabla con cada número de serie o lote, su cantidad y demás detalles
4. Se vincula al renglón del artículo en la transacción

**Beneficios:**
- Mejor integridad de datos
- Consultas más rápidas sobre trazabilidad
- Soporte para inspección de calidad por lote
- Informes de trazabilidad más precisos

### 3.2 Pick List

**¿Qué es?** Un documento de preparación de pedidos que indica qué artículos tomar de qué ubicaciones.

**Cómo usarlo:**
1. Desde una **Orden de Venta**, hacer clic en **Create → Pick List**
2. El sistema genera un Pick List con las ubicaciones sugeridas
3. El operador de almacén usa el Pick List para preparar el pedido
4. Se escanean los códigos de barras para confirmar la recolección
5. Desde el Pick List, hacer clic en **Create → Delivery Note** para generar la entrega

### 3.3 Stock Reservation

**¿Qué es?** La capacidad de reservar inventario específico para una Orden de Venta o Work Order.

**Cómo usarlo:**
1. Crear y enviar una **Orden de Venta**
2. Hacer clic en el botón **Reserve Stock**
3. Seleccionar el almacén y las cantidades a reservar
4. El stock queda bloqueado y no aparece como disponible para otros pedidos
5. Al crear la Nota de Entrega, se consume el stock reservado
6. Si se cancela la orden, la reserva se libera

### 3.4 Putaway Rule

**¿Qué es?** Una regla que determina automáticamente a qué ubicación (almacén/bin) debe ir el stock entrante.

**Cómo configurarlo:**
1. Ir a **Stock → Putaway Rule → Nuevo**
2. Definir condiciones: artículo, grupo, capacidad del almacén
3. Definir la acción: almacén destino, prioridad
4. Al crear un Purchase Receipt o Stock Entry de recepción, el sistema aplica la regla automáticamente

### 3.5 Inventory Dimensions

**¿Qué es?** Campos personalizados que actúan como dimensiones adicionales de seguimiento de inventario, más allá de Almacén y Artículo.

**Cómo configurarlo:**
1. Ir a **Stock → Inventory Dimension → Nuevo**
2. Definir el campo personalizado (ej: "Proyecto", "Sucursal")
3. El campo se agrega automáticamente a los doctypes de inventario
4. Al hacer cualquier movimiento de stock, se debe especificar el valor de la dimensión
5. Los reportes de stock pueden filtrar y agrupar por estas dimensiones

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Serial and Batch Bundle

⚠️ **Este es el cambio más rompiente del módulo de inventario.**

| Aspecto | Impacto | Acción Requerida |
|---------|---------|-----------------|
| Campos de texto | Los campos `serial_no` y `batch_no` en las tablas hijo ya no se usan | Actualizar custom scripts que lean/escriban estos campos |
| Print Formats | Formatos de impresión que muestran series/lotes | Actualizar para obtener datos del Bundle |
| Consultas SQL | Queries que buscan en `serial_no`/`batch_no` como texto | Reescribir usando el Bundle como referencia |
| APIs | Integraciones que envían series/lotes como texto | Actualizar para crear/vincular Bundles |

**Código ejemplo — Obtener seriales del Bundle:**
```python
# Antes (v13):
serial_nos = item.serial_no.split("\n")

# Después (v15+):
from erpnext.stock.doctype.serial_and_batch_bundle.serial_and_batch_bundle import get_serial_or_batch_nos
serial_nos = get_serial_or_batch_nos(item.serial_and_batch_bundle)
```

### 4.2 Inventory Dimensions

- Scripts personalizados que consultan `Stock Ledger Entry` sin considerar dimensiones obtendrán datos incompletos
- Las consultas de stock deben incluir filtros por las dimensiones definidas
- La migración crea las columnas con valores vacíos; se debe definir un plan para llenar datos históricos si se requiere

### 4.3 Stock Reservation

- APIs que crean Stock Entry directamente (sin pasar por el flujo estándar de Orden de Venta → Nota de Entrega) pueden consumir stock reservado
- Deben validar si hay reservaciones antes de transferir stock

### 4.4 Pick List

- Si tenían un proceso de picking personalizado (scripts, apps), podría conflictar con el Pick List estándar
- Se recomienda evaluar si el Pick List estándar cubre las necesidades antes de mantener soluciones personalizadas

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Stock Balance (Saldo de Stock)
- Ahora se muestra como **árbol expandible** agrupado por Almacén o Artículo
- Filtros por Inventory Dimension disponibles
- Vista de proyección de stock disponible

### 5.2 Item Master (Ficha del Artículo)
- Nueva pestaña **"Inventario"** con configuración de dimensiones, reservas y putaway
- Los campos de serial/lote ahora referencian la configuración del Bundle
- Configuración de cuentas contables de inventario a nivel de artículo (v16)

### 5.3 Stock Entry
- Formulario reorganizado con pestañas
- El campo de serial/lote muestra un botón para crear/vincular el Bundle en lugar de un campo de texto

### 5.4 Delivery Note / Purchase Receipt
- La tabla de artículos muestra un link al Serial and Batch Bundle en lugar de campos de texto
- Al hacer clic, se abre el detalle del Bundle con cada serial/lote

---

## 6. Pruebas de Validación (UAT)

### Instrucciones Generales
- Ejecutar cada prueba en el **entorno de staging**
- Registrar el resultado en la [Plantilla de Feedback](./plantilla_feedback.md)
- Si una prueba falla, documentar el error con captura de pantalla

---

### UAT-INV-01: Recepción de Material (Purchase Receipt)

**Objetivo:** Verificar el flujo básico de recepción de material.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una Orden de Compra con 2 artículos estándar | OC creada y enviada |
| 2 | Desde la OC, crear **Purchase Receipt** | Se genera el recibo con los artículos |
| 3 | Verificar que los almacenes se pre-llenan | Los almacenes por defecto aparecen |
| 4 | Enviar el Purchase Receipt | Stock se incrementa en el almacén |
| 5 | Verificar en **Stock Ledger** | Las entradas existen con valuación correcta |
| 6 | Verificar en **Stock Balance** | Las cantidades reflejan la recepción |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-02: Recepción con Serial and Batch Bundle

**Objetivo:** Verificar el nuevo sistema de Series y Lotes.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un artículo con **Has Serial No = Sí** | Artículo configurado |
| 2 | Crear un Purchase Receipt para ese artículo (qty = 5) | Formulario abierto |
| 3 | En la línea del artículo, hacer clic en **Serial and Batch Bundle** | Se abre el formulario del Bundle |
| 4 | Ingresar 5 números de serie | Los seriales se registran en la tabla |
| 5 | Guardar el Bundle y enviar el Purchase Receipt | Stock se registra con seriales vinculados |
| 6 | Verificar en **Serial No** que los 5 seriales existen | Los seriales aparecen como activos con ubicación correcta |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-03: Recepción con Lotes (Batch)

**Objetivo:** Verificar el manejo de lotes con el nuevo Bundle.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un artículo con **Has Batch No = Sí** | Artículo configurado |
| 2 | Crear un Purchase Receipt con cantidad = 100 | Formulario abierto |
| 3 | En el Bundle, crear un lote nuevo con fecha de caducidad | Lote creado con expiry date |
| 4 | Enviar el Purchase Receipt | Stock se registra con el lote |
| 5 | Verificar en **Batch** que el lote existe | El lote aparece con cantidad y fecha de caducidad |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-04: Pick List para Entrega

**Objetivo:** Verificar el flujo de Pick List → Delivery Note.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear y enviar una **Orden de Venta** con 3 artículos | OV enviada |
| 2 | Desde la OV, hacer clic en **Create → Pick List** | Se genera el Pick List con ubicaciones sugeridas |
| 3 | Verificar las ubicaciones de picking sugeridas | Las ubicaciones corresponden al stock disponible |
| 4 | Confirmar las cantidades en el Pick List | Las cantidades coinciden con la orden |
| 5 | Desde el Pick List, hacer clic en **Create → Delivery Note** | Se genera la Nota de Entrega |
| 6 | Enviar la Delivery Note | Stock se reduce correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-05: Stock Reservation

**Objetivo:** Verificar la reserva de stock contra una Orden de Venta.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar stock disponible del artículo (ej: 50 unidades) | Stock confirmado |
| 2 | Crear y enviar una Orden de Venta por 30 unidades | OV enviada |
| 3 | Hacer clic en **Reserve Stock** | Se crea la reservación |
| 4 | Verificar que el stock disponible (no reservado) es 20 | Stock disponible = 50 - 30 = 20 |
| 5 | Intentar crear otra OV por 25 unidades y reservar | El sistema advierte que solo hay 20 disponibles |
| 6 | Crear Delivery Note desde la primera OV | Se consume el stock reservado |
| 7 | Verificar que la reserva se libera | La reservación ya no existe |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-06: Stock Entry - Transferencia entre Almacenes

**Objetivo:** Verificar transferencias de material entre almacenes.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Stock → Stock Entry → Nuevo** | Formulario abierto |
| 2 | Seleccionar tipo: **Material Transfer** | Campos de almacén origen y destino aparecen |
| 3 | Agregar artículos con almacén origen y destino | Artículos configurados |
| 4 | Enviar el Stock Entry | Se reduce stock en origen y se incrementa en destino |
| 5 | Verificar en Stock Balance | Ambos almacenes reflejan el cambio |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-07: Inter Company Stock Transfer

**Objetivo:** Verificar transferencias de stock entre empresas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Inter Company Stock Transfer → Nuevo** | Formulario abierto |
| 2 | Seleccionar empresa origen y destino | Campos configurados |
| 3 | Agregar artículos a transferir | Artículos con cantidades |
| 4 | Enviar la transferencia | Se crean Stock Entries en ambas empresas |
| 5 | Verificar stock en ambas empresas | Origen (-) y destino (+) correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-08: Putaway Rule

**Objetivo:** Verificar que las reglas de ubicación dirigen el stock entrante automáticamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Putaway Rule** para un artículo → Almacén X | Regla creada |
| 2 | Crear un Purchase Receipt para ese artículo **sin** especificar almacén | El sistema aplica la regla de putaway |
| 3 | Verificar que el almacén asignado es X | El almacén en el recibo es X |
| 4 | Enviar y verificar en Stock Balance | El stock se registró en Almacén X |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-09: Inventory Dimensions (v16)

**Objetivo:** Verificar el funcionamiento de dimensiones de inventario personalizadas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Inventory Dimension** (ej: "Proyecto") | Dimensión creada y campos agregados |
| 2 | Crear un Stock Entry de recepción con valor de dimensión | El campo de proyecto aparece y se llena |
| 3 | Crear otro Stock Entry de recepción con otro valor de dimensión | Stock registrado con dimensión diferente |
| 4 | Verificar en **Stock Balance** filtrando por dimensión | Los saldos se muestran por dimensión |
| 5 | Intentar crear un Stock Entry sin el valor de dimensión | El sistema solicita el valor (si es obligatorio) |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-10: Stock Reconciliation

**Objetivo:** Verificar el proceso de reconciliación de inventario.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Stock → Stock Reconciliation → Nuevo** | Formulario abierto |
| 2 | Descargar la plantilla de reconciliación | CSV descargado con artículos y cantidades actuales |
| 3 | Modificar cantidades en el CSV y reimportar | Las diferencias se muestran |
| 4 | Enviar la reconciliación | Los ajustes de stock se aplican |
| 5 | Verificar en Stock Balance | Las cantidades coinciden con lo importado |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-11: Reporte de Trazabilidad de Series/Lotes (v16)

**Objetivo:** Verificar el reporte de trazabilidad end-to-end.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Stock → Serial and Batch Traceability** | El reporte se abre |
| 2 | Buscar un número de serie o lote específico | Se muestra toda la cadena de movimientos |
| 3 | Verificar trazabilidad hacia adelante (materia prima → cliente) | La cadena muestra cada paso correctamente |
| 4 | Verificar trazabilidad hacia atrás (producto → materia prima) | Los orígenes se identifican correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-INV-12: Reportes Generales de Stock

**Objetivo:** Verificar que los reportes principales de inventario funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Stock Balance** (Saldo de Stock) | Datos correctos, carga rápidamente |
| 2 | Generar **Stock Ledger** (Libro de Stock) | Detalle de movimientos correcto |
| 3 | Generar **Stock Ageing** (Antigüedad de Stock) | Datos de antigüedad correctos |
| 4 | Generar **Item-wise Stock Movement** | Movimientos por artículo correctos |
| 5 | Verificar vista de árbol del Stock Balance | La vista expandible funciona |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Inventario/Stock — Dossier de Migración ERPNext v13 → v16*
