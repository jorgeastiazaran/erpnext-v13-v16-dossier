# Plantilla de Registro de Feedback — Migración ERPNext v13 → v16

---

## Instrucciones

1. Complete una plantilla por cada módulo que pruebe
2. Ejecute los casos de prueba indicados en la guía del módulo correspondiente
3. Registre el resultado de cada prueba (PASA / FALLA)
4. Para pruebas fallidas, agregue evidencia (captura de pantalla, descripción del error)
5. Clasifique la severidad de cada hallazgo
6. Entregue esta plantilla al equipo de migración al finalizar las pruebas

---

## Datos Generales

| Campo | Valor |
|-------|-------|
| **Nombre del Evaluador** | |
| **Departamento / Área** | |
| **Módulo Evaluado** | |
| **Fecha de Inicio de Pruebas** | |
| **Fecha de Fin de Pruebas** | |
| **Versión ERPNext** | v16.9.0 |
| **Entorno** | Staging / Producción |

---

## Resultados de Pruebas

### Resumen

| Total de Pruebas | Pasaron | Fallaron | No Ejecutadas |
|:----------------:|:-------:|:--------:|:-------------:|
| | | | |

---

### Detalle de Pruebas

Copie y pegue la siguiente tabla para cada caso de prueba ejecutado:

---

#### Prueba: [ID de la prueba, ej: UAT-CONT-01]

| Campo | Valor |
|-------|-------|
| **ID de Prueba** | |
| **Nombre de la Prueba** | |
| **Resultado** | ☐ PASA / ☐ FALLA / ☐ NO EJECUTADA |
| **Severidad (si falla)** | ☐ Crítico / ☐ Mayor / ☐ Menor / ☐ Cosmético |
| **Descripción del Error** | |
| **Pasos para Reproducir** | |
| **Evidencia (capturas)** | (adjuntar archivos o pegar URLs) |
| **Observaciones Adicionales** | |

---

#### Prueba: [ID]

| Campo | Valor |
|-------|-------|
| **ID de Prueba** | |
| **Nombre de la Prueba** | |
| **Resultado** | ☐ PASA / ☐ FALLA / ☐ NO EJECUTADA |
| **Severidad (si falla)** | ☐ Crítico / ☐ Mayor / ☐ Menor / ☐ Cosmético |
| **Descripción del Error** | |
| **Pasos para Reproducir** | |
| **Evidencia (capturas)** | |
| **Observaciones Adicionales** | |

---

#### Prueba: [ID]

| Campo | Valor |
|-------|-------|
| **ID de Prueba** | |
| **Nombre de la Prueba** | |
| **Resultado** | ☐ PASA / ☐ FALLA / ☐ NO EJECUTADA |
| **Severidad (si falla)** | ☐ Crítico / ☐ Mayor / ☐ Menor / ☐ Cosmético |
| **Descripción del Error** | |
| **Pasos para Reproducir** | |
| **Evidencia (capturas)** | |
| **Observaciones Adicionales** | |

---

*(Copie la sección de arriba para cada prueba adicional)*

---

## Clasificación de Severidad

| Severidad | Definición | Ejemplo |
|-----------|-----------|---------|
| 🔴 **Crítico** | La funcionalidad no opera, se pierden datos, o bloquea la operación | No se puede crear factura, errores de base de datos |
| 🟠 **Mayor** | La funcionalidad opera incorrectamente, pero hay workaround | Cálculos incorrectos, campos que no se llenan automáticamente |
| 🟡 **Menor** | Inconveniente o diferencia estética que no impide la operación | Labels incorrectos, alineación visual, orden de campos |
| 🟢 **Cosmético** | Mejora deseable pero no afecta la funcionalidad | Colores, tamaños de fuente, espaciado |

---

## Observaciones Generales del Módulo

Use esta sección para comentarios generales que no estén asociados a una prueba específica:

### ¿Qué funciona bien?
> (Describa las funcionalidades que operan correctamente y las mejoras que nota respecto a v13)

### ¿Qué no funciona o funciona diferente?
> (Describa problemas generales o comportamientos inesperados)

### ¿Qué capacitación adicional necesita?
> (Describa las áreas donde necesita capacitación para entender los nuevos flujos)

### Sugerencias
> (Cualquier sugerencia para mejorar la experiencia o el proceso de migración)

---

## Firma de Validación

| Campo | Valor |
|-------|-------|
| **Evaluador** | Nombre: _____________ Firma: _____________ Fecha: _____________ |
| **Responsable del Módulo** | Nombre: _____________ Firma: _____________ Fecha: _____________ |
| **Equipo de Migración** | Nombre: _____________ Firma: _____________ Fecha: _____________ |

### Resultado Final del Módulo

| ☐ **APROBADO** — El módulo opera correctamente y está listo para producción |
|:---|
| ☐ **APROBADO CON OBSERVACIONES** — El módulo opera, pero hay issues menores por resolver |
| ☐ **NO APROBADO** — El módulo tiene issues críticos que deben resolverse antes de ir a producción |

---

*Plantilla de Feedback — Dossier de Migración ERPNext v13 → v16*
