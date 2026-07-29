# Dossier de Migración ERPNext v13 → v16
## Resumen Ejecutivo

**Fecha:** Julio 2026  
**Versiones objetivo:** ERPNext v16.9.0 / Frappe Framework v16.17.0  
**Versión actual:** ERPNext v13  

---

## 1. Objetivo

Este dossier documenta de manera exhaustiva los cambios funcionales, arquitectónicos y de experiencia de usuario introducidos en ERPNext desde la versión 13 hasta la versión 16. Su propósito es servir como guía para que los usuarios de cada módulo:

1. **Comprendan** los cambios que encontrarán después de la migración
2. **Prueben** las funcionalidades clave en un entorno de staging
3. **Reporten** cualquier problema o necesidad de capacitación adicional

---

## 2. Ruta de Migración

> ⚠️ **No es posible migrar directamente de v13 a v16.** La ruta correcta es:
>
> **v13 → v14 → v15 → v16**
>
> Cada salto de versión aplica parches de base de datos, esquema y datos que deben ejecutarse secuencialmente.

### Prerrequisitos Técnicos

| Componente | v13 | v16 (Requerido) |
|-----------|-----|-----------------|
| Python | 3.8-3.9 | 3.11+ |
| Node.js | 14 | 20+ |
| MariaDB | 10.3+ | 10.6+ |
| Redis | 5.0+ | 7.0+ |
| Frappe Framework | v13.x | v16.17.0 |

---

## 3. Mapa de Impacto por Módulo

El siguiente mapa muestra el nivel de cambio que experimentará cada módulo:

| Módulo | Nivel de Impacto | Cambio Principal |
|--------|:----------------:|------------------|
| **Contabilidad** | 🔴 Alto | Nuevo doctype Payment, Dunning, Tax Withholding Category, reconciliación bancaria mejorada |
| **Inventario/Stock** | 🔴 Alto | Serial and Batch Bundle, Stock Reservation, Inventory Dimensions, Pick List |
| **Ventas** | 🟡 Medio-Alto | CRM separado (Frappe CRM), POS rediseñado, nuevo flujo de pagos |
| **Compras** | 🟡 Medio-Alto | Subcontratación integrada en Compras, nuevo flujo de pagos |
| **Manufactura** | 🔴 Alto | BOM Versioning, Routing, Phantom BOM, Shop Floor, Subcontracting Order removido |
| **RRHH** | 🔴 Crítico | Módulo completamente separado → app `hrms` independiente |
| **Calidad** | 🟢 Medio | Non-Conformance, CAPA, auto-creación de inspecciones |
| **Mantenimiento** | 🟡 Medio-Alto | Módulo fusionado con Assets, doctypes removidos |
| **Framework/UI** | 🔴 Alto | Nueva UI (Espresso/Vue 3), Form Builder, permisos, APIs deprecadas |

---

## 4. Cambios Arquitectónicos Críticos

### 4.1 Separación de Módulos (App Decoupling)

Uno de los cambios más significativos es la estrategia de **"de-monolización"** que Frappe adoptó desde v14:

| Módulo/Función | Versión | Acción |
|---------------|---------|--------|
| **RRHH y Nómina** | v14-v15 | Extraído a la app `hrms` |
| **CRM** (Lead, Opportunity, Campaign) | v16 | Extraído a la app `Frappe CRM` |
| **E-commerce** | v15 | Extraído a la app `Webshop` |
| **Pagos** (Payment Gateways) | v15 | Extraído a app `payments` |
| **Educación** | v14 | Extraído a app separada |
| **Healthcare** | v14 | Extraído a app separada |
| **Helpdesk/Soporte** | v15 | Extraído a app `helpdesk` |
| **Localizaciones regionales** (KSA, Francia) | v15 | Extraídas a apps separadas |

**Implicación:** Después de la migración, deben instalar las apps separadas para cada funcionalidad que utilicen. Sin la app correspondiente, los menús y datos no serán accesibles.

### 4.2 Serial and Batch Bundle (v15)

El cambio más impactante para operaciones de inventario:

- **Antes (v13):** Los números de serie y lotes se manejaban como campos de texto libre
- **Después (v15+):** Se introduce el doctype **Serial and Batch Bundle** como un documento estructurado que se vincula a las transacciones

Esto afecta: Entradas de Stock, Notas de Entrega, Facturas, Recibos de Compra, Órdenes de Manufactura.

### 4.3 Nuevo Sistema de Pagos (v16)

- **Antes (v13):** Payment Entry y Journal Entry para registrar pagos
- **Después (v16):** Nuevo doctype **Payment** que unifica ambos flujos

### 4.4 Subcontratación Rediseñada (v15)

- **Antes (v13):** Subcontracting Order en el módulo de Manufactura
- **Después (v15+):** Orden de Compra con tipo "Subcontratación" en el módulo de Compras

---

## 5. Estructura del Dossier

Este dossier contiene las siguientes guías detalladas:

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [Contabilidad](./01_contabilidad.md) | Payment, Dunning, Tax Withholding, Bank Reconciliation, dimensiones contables |
| 02 | [Inventario](./02_inventario.md) | Serial/Batch Bundle, Pick List, Stock Reservation, Inventory Dimensions |
| 03 | [Ventas](./03_ventas.md) | POS rediseñado, CRM separado, nuevo flujo de pagos |
| 04 | [Compras](./04_compras.md) | Subcontratación en Compras, nuevo flujo de pagos, Supplier Scorecard |
| 05 | [Manufactura](./05_manufactura.md) | BOM Versioning, Routing, Phantom BOM, Shop Floor |
| 06 | [Recursos Humanos](./06_recursos_humanos.md) | Separación a app HRMS, nuevos doctypes, nómina mejorada |
| 07 | [Calidad](./07_calidad.md) | Non-Conformance, CAPA, auto-inspecciones |
| 08 | [Mantenimiento](./08_mantenimiento.md) | Fusión con Assets, nuevos flujos de mantenimiento |
| 09 | [Framework Frappe](./09_framework_frappe.md) | UI, permisos, APIs, impresión, navegación |
| -- | [Plantilla de Feedback](./plantilla_feedback.md) | Formato para registrar resultados de pruebas |

---

## 6. Proceso de Validación Recomendado

### Fase 1: Distribución y Lectura (Semana 1)
- Distribuir guías a los responsables de cada módulo
- Reunión kickoff de 30 minutos explicando el proceso
- Los usuarios leen su(s) guía(s) y anotan dudas

### Fase 2: Sesiones de Demostración (Semana 2)
- Sesiones de 1-2 horas por módulo en el entorno de staging
- Demostración en vivo de los cambios principales
- Resolución de dudas en tiempo real

### Fase 3: Ejecución de Pruebas UAT (Semanas 3-4)
- Los usuarios ejecutan los scripts de prueba en staging
- Registran resultados usando la plantilla de feedback
- Soporte disponible para resolver bloqueos

### Fase 4: Recopilación y Análisis de Feedback (Semana 5)
- Consolidar observaciones de todos los módulos
- Clasificar: 🔴 Bloqueante / 🟡 Mejora / 🟢 Capacitación
- Sesión de revisión por área

### Fase 5: Resolución y Sign-off (Semana 6)
- Resolver issues bloqueantes
- Documentar decisiones
- Firma de aceptación por módulo

---

## 7. Contacto y Soporte

Para dudas sobre el contenido de este dossier o el proceso de validación, contactar al equipo de migración.

---

*Documento generado como parte del proceso de migración ERPNext v13 → v16.*
