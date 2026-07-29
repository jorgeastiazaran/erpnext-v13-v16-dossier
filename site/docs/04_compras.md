# Guía de Migración: Módulo de Compras (Buying)
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

| Área | Cambio | Impacto |
|------|--------|---------|
| Subcontratación | **Subcontracting integrado en Compras** (v15) — Subcontracting Order removido | 🔴 Alto |
| Pagos | Nuevo flujo con doctype **Payment** | 🟡 Medio |
| Retención fiscal | **Tax Withholding Category** (v15) | 🟡 Medio |
| Evaluación | **Supplier Scorecard** para evaluar proveedores | 🟢 Bajo |
| Comparación | Herramienta de comparación de cotizaciones mejorada | 🟢 Bajo |
| RFQ | Request for Quotation workflow mejorado | 🟢 Bajo |
| Impuestos | **Purchase Taxes and Charges Template** | 🟢 Bajo |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Supplier Scorecard
- Nuevo doctype para evaluar el rendimiento de proveedores
- Criterios configurables: calidad, tiempo de entrega, precio, servicio
- Cálculo automático de puntuación basado en transacciones históricas
- Permite establecer acciones automáticas según la puntuación (ej: bloquear proveedor si cae debajo de umbral)

#### b) Mejoras en Request for Quotation (RFQ)
- Puede enviarse a múltiples proveedores simultáneamente
- Las respuestas de los proveedores se rastrean dentro del mismo doctype
- Integración con el portal de proveedores para que respondan en línea

#### c) Herramienta de Comparación de Cotizaciones
- Interfaz mejorada de comparación lado a lado de **Supplier Quotations**
- Permite comparar precios, términos de pago, tiempos de entrega
- Selección directa del proveedor ganador para crear Orden de Compra

#### d) Quality Inspection en Purchase Receipt
- Al recibir material, se puede crear una **Quality Inspection** directamente
- Si el artículo requiere inspección, el sistema bloquea la recepción hasta completarla

#### e) Purchase Taxes and Charges Template
- Plantillas preconfiguradas de impuestos para compras
- Permite aplicar rápidamente combinaciones de impuestos frecuentes

### 2.2 Cambios en v15 (desde v14)

#### a) Subcontratación Integrada en Compras ⭐

> ⚠️ **Este es el cambio más significativo del módulo de Compras.**

La subcontratación (maquila) fue completamente rediseñada y movida al módulo de Compras:

| Aspecto | Antes (v13) | Después (v15+) |
|---------|-------------|----------------|
| Documento principal | **Subcontracting Order** (módulo Manufactura) | **Purchase Order** con tipo "Subcontracting" |
| Suministro de material | Stock Entry manual desde Manufactura | Stock Entry vinculado directamente a la OC |
| Recepción de PT | Mediante proceso especial | **Purchase Receipt** estándar |
| BOM | Se referenciaba desde la Subcontracting Order | Se referencia desde el Item en la OC |
| Módulo | Manufactura | Compras |

**Flujo nuevo de subcontratación:**
1. Crear **Purchase Order** → marcar tipo como **"Subcontracting"**
2. En la tabla de artículos, el sistema detecta que el artículo tiene BOM y muestra los materiales a suministrar
3. Hacer clic en **Supply Raw Materials** → se genera un **Stock Entry** de tipo "Material Transfer to Subcontractor"
4. El subcontratista fabrica el producto
5. Crear **Purchase Receipt** para recibir el producto terminado
6. El sistema descuenta automáticamente las materias primas suministradas

#### b) Tax Withholding Category
- Doctype maestro para retención fiscal automática en compras
- Se vincula al Proveedor → la retención se calcula automáticamente al enviar la factura
- (Ver detalles en la [Guía de Contabilidad](./01_contabilidad.md#34-tax-withholding-category))

#### c) Buying Settings Mejoradas
- Nuevas opciones de configuración:
  - "Allow Backdated Purchase Receipts" (Permitir recibos con fecha retroactiva)
  - "Allow Over-receipt" con tolerancia porcentual
  - Configuración de proveedor por defecto para artículos

#### d) Serial and Batch Bundle en Compras
- Las recepciones de compra ahora usan el **Serial and Batch Bundle** para registrar series y lotes
- (Ver detalles en la [Guía de Inventario](./02_inventario.md#31-serial-and-batch-bundle))

### 2.3 Cambios en v16 (desde v15)

#### a) Nuevo Flujo de Pagos
- Pagos a proveedores ahora usan el doctype **Payment** en lugar de Payment Entry
- Flujo simplificado: Factura de Compra → botón "Crear Payment" → pago registrado

#### b) Purchase Expense Booking
- Simplifica el registro de costos adicionales de compra (flete, seguro, aranceles)
- Estos costos se asignan automáticamente a los artículos para calcular el COGS correcto
- Complementa el **Landed Cost Voucher** existente

#### c) Subcontratación Refinada
- El flujo de subcontratación se refinó con mejor tracking de materiales suministrados
- Soporte para **Inward Subcontracting**: recibir materiales del cliente para fabricar

#### d) Purchase Analytics con Dimensiones
- Los reportes de compras ahora filtran por Inventory Dimensions

---

## 3. Nuevas Funcionalidades

### 3.1 Subcontratación (Nuevo Flujo)

**Configuración previa:**
1. El artículo a subcontratar debe tener una **BOM** (Lista de Materiales) activa
2. El artículo debe estar marcado como "Is Sub Contracted Item = Yes"
3. Tener un proveedor subcontratista configurado

**Flujo de operación:**
1. **Crear Orden de Compra:**
   - Ir a Compras → Purchase Order → Nuevo
   - Agregar el artículo subcontratado
   - El sistema detecta automáticamente que requiere subcontratación
   - Se muestra la tabla de **Raw Materials Supplied** con los materiales según la BOM
   
2. **Suministrar Materias Primas:**
   - Desde la OC, hacer clic en **Transfer → Supply Raw Materials**
   - Se genera un Stock Entry de tipo "Material Transfer to Subcontractor"
   - Las materias primas se transfieren al almacén del subcontratista
   
3. **Recibir Producto Terminado:**
   - Desde la OC, hacer clic en **Create → Purchase Receipt**
   - Al enviar el recibo, el sistema:
     - Ingresa el producto terminado al almacén
     - Descuenta las materias primas del almacén del subcontratista

### 3.2 Supplier Scorecard

**Configuración:**
1. Ir a **Compras → Supplier Scorecard Criteria** y definir criterios
2. Crear una **Supplier Scorecard Period** para evaluar
3. El sistema calcula puntuaciones basadas en:
   - Porcentaje de entregas a tiempo
   - Porcentaje de artículos aceptados vs rechazados
   - Variación de precio vs cotización
4. Se puede automatizar: si la puntuación cae debajo de un umbral, el sistema puede prevenir nuevas OC a ese proveedor

### 3.3 Purchase Expense Booking (v16)

**¿Qué es?** Permite registrar costos adicionales de compra de manera simplificada.

**Cómo usarlo:**
1. Al crear un Purchase Receipt, se pueden agregar gastos adicionales
2. Los gastos se distribuyen proporcionalmente entre los artículos recibidos
3. El COGS se actualiza con el costo total real (precio + gastos)
4. Alternativa al Landed Cost Voucher para casos simples

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Subcontracting Order → Purchase Order

| Aspecto | Impacto | Acción Requerida |
|---------|---------|-----------------|
| Subcontracting Order | Doctype removido en v15 | Cerrar todas las Subcontracting Orders abiertas antes de migrar |
| Custom Scripts | Scripts que usen `Subcontracting Order` fallarán | Reescribir para usar Purchase Order con tipo "Subcontracting" |
| Reportes | Reportes personalizados de subcontratación | Actualizar consultas para usar Purchase Order |
| Flujo de trabajo | Workflow de aprobación de subcontratación | Rediseñar usando Purchase Order |
| Datos históricos | Las Subcontracting Orders históricas permanecen pero inaccesibles | Los datos están en la BD pero sin doctype activo |

⚠️ **Acción crítica antes de migrar:**
1. Cerrar todas las Subcontracting Orders pendientes
2. Documentar cualquier proceso personalizado de subcontratación
3. Crear los Purchase Orders equivalentes en el nuevo sistema después de migrar

### 4.2 Tax Withholding
- Mismo impacto que en Contabilidad — ver [Guía de Contabilidad](./01_contabilidad.md#41-tax-withholding-retención-fiscal)

### 4.3 Payment Entry → Payment
- Mismo impacto que en Contabilidad — ver [Guía de Contabilidad](./01_contabilidad.md#42-payment-entry--payment)

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Purchase Order
- Nuevo toggle de **"Subcontracting"** que revela campos de materias primas y BOM
- Tabla de artículos con pestañas para información adicional
- Indicador de progreso de recepción mejorado

### 5.2 Supplier Quotation Comparison
- Vista lado a lado para comparar cotizaciones de proveedores
- Resaltado visual de mejor precio por artículo
- Botón directo para crear OC desde la cotización ganadora

### 5.3 Purchase Receipt
- Serial and Batch Bundle integrado en la tabla de artículos
- Indicador de Quality Inspection pendiente
- Campos de Putaway Rule visibles

### 5.4 Ficha de Proveedor
- Nueva sección de Tax Withholding Category
- Link al Supplier Scorecard
- Historial de transacciones mejorado

---

## 6. Pruebas de Validación (UAT)

---

### UAT-COM-01: Flujo Completo Solicitud → Cotización → OC → Recepción → Factura

**Objetivo:** Verificar el ciclo completo de compra.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Material Request** (Solicitud de Material) | Solicitud creada |
| 2 | Desde la Solicitud, crear **Request for Quotation** | RFQ creada con artículos |
| 3 | Enviar la RFQ a 2 proveedores | RFQ enviada por email |
| 4 | Crear **Supplier Quotation** para cada proveedor | 2 cotizaciones creadas |
| 5 | Usar la herramienta de **Comparación** | Se muestran las cotizaciones lado a lado |
| 6 | Seleccionar el proveedor ganador y crear **Purchase Order** | OC creada con datos de la cotización |
| 7 | Enviar la OC | OC en estado Enviada |
| 8 | Desde la OC, crear **Purchase Receipt** | Recibo con artículos correctos |
| 9 | Enviar el Purchase Receipt | Stock se incrementa |
| 10 | Desde la OC, crear **Purchase Invoice** | Factura creada |
| 11 | Enviar la Factura de Compra | Asientos GL creados |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-02: Subcontratación (Nuevo Flujo)

**Objetivo:** Verificar el nuevo flujo de subcontratación en Compras.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar que el artículo tiene BOM y "Is Sub Contracted Item = Yes" | Artículo configurado |
| 2 | Crear una **Purchase Order** y agregar el artículo subcontratado | El sistema detecta que es subcontratación |
| 3 | Verificar que se muestra la tabla de **Raw Materials Supplied** | Los materiales según BOM aparecen |
| 4 | Enviar la OC | OC enviada |
| 5 | Hacer clic en **Supply Raw Materials** | Se genera el Stock Entry de transferencia |
| 6 | Enviar el Stock Entry | Las materias primas se transfieren al almacén del subcontratista |
| 7 | Crear **Purchase Receipt** desde la OC | Se genera el recibo |
| 8 | Enviar el Purchase Receipt | Producto terminado ingresa al almacén, materias primas se descontaron |
| 9 | Verificar stock de materias primas y producto terminado | Cantidades correctas |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-03: Tax Withholding en Compras

**Objetivo:** Verificar la retención fiscal automática en compras.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Tax Withholding Category** (ej: "ISR 10%") | Categoría creada |
| 2 | Vincular al Proveedor | Categoría asignada en la ficha del proveedor |
| 3 | Crear una **Purchase Invoice** para ese proveedor | Factura creada |
| 4 | Verificar que la retención se calcula automáticamente | Monto de retención visible en impuestos |
| 5 | Enviar la factura y verificar en el Libro Mayor | La cuenta de retención tiene el monto correcto |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-04: Pago a Proveedor (Nuevo Doctype Payment)

**Objetivo:** Verificar el pago a proveedores con el nuevo sistema.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear y enviar una **Purchase Invoice** | Factura enviada |
| 2 | Desde la factura, hacer clic en **Create → Payment** | Se abre Payment pre-llenado |
| 3 | Verificar datos pre-llenados (proveedor, monto, factura) | Datos correctos |
| 4 | Enviar el Payment | Pago registrado, factura marcada como pagada |
| 5 | Verificar en el Libro Mayor | Asientos contables correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-05: Supplier Scorecard

**Objetivo:** Verificar la evaluación de proveedores.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar criterios de **Supplier Scorecard** | Criterios definidos |
| 2 | Generar un período de evaluación | Período creado |
| 3 | Verificar que las puntuaciones se calculan automáticamente | Basado en transacciones históricas |
| 4 | Revisar el detalle de puntuación por criterio | Cada criterio tiene su puntaje |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-06: Purchase Receipt con Quality Inspection

**Objetivo:** Verificar la inspección de calidad al recibir material.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar un artículo con **Inspection Required Before Purchase = Yes** | Artículo configurado |
| 2 | Crear una OC y Purchase Receipt para ese artículo | Recibo creado |
| 3 | Intentar enviar el Purchase Receipt sin inspección | El sistema bloquea el envío |
| 4 | Crear **Quality Inspection** desde el Purchase Receipt | Inspección creada |
| 5 | Completar la inspección con resultado "Accepted" | Inspección aceptada |
| 6 | Enviar el Purchase Receipt | El recibo se envía exitosamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-07: Landed Cost Voucher

**Objetivo:** Verificar la asignación de costos adicionales de compra.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear y enviar un Purchase Receipt con 2 artículos | Recibo enviado |
| 2 | Crear un **Landed Cost Voucher** | Formulario abierto |
| 3 | Vincular el Purchase Receipt y agregar gastos (ej: flete $500) | Gastos configurados |
| 4 | Enviar el voucher | Los costos se distribuyen entre artículos |
| 5 | Verificar la valuación de los artículos | El costo unitario incluye el gasto distribuido |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-08: Recepción Parcial

**Objetivo:** Verificar la recepción parcial de mercancías.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear OC por 100 unidades | OC enviada |
| 2 | Crear Purchase Receipt por 60 unidades | Recepción parcial registrada |
| 3 | Verificar que la OC muestra 60% recibido | Indicador de progreso correcto |
| 4 | Crear segundo Purchase Receipt por 40 unidades | Recepción completada |
| 5 | Verificar que la OC muestra 100% recibido | Indicador completo |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-COM-09: Reportes de Compras

**Objetivo:** Verificar que los reportes principales de compras funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Purchase Analytics** | Datos correctos |
| 2 | Generar **Purchase Register** | Detalle de compras correcto |
| 3 | Generar **Items to be Received** (Artículos por recibir) | Listado correcto |
| 4 | Generar **Supplier-Wise Sales Analytics** | Análisis por proveedor correcto |
| 5 | Generar **Subcontracting Order Summary** (si aplica) | Resumen de subcontratación correcto |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Compras — Dossier de Migración ERPNext v13 → v16*
