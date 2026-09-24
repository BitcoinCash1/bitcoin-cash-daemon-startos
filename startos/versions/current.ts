import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

/**
 * Whether users may downgrade from this release to an earlier one. Set it per
 * release: `true` only when earlier versions can still read the data this one
 * leaves behind, `false` when this release is one-way.
 */
const ALLOW_DOWNGRADE = false

export const current = VersionInfo.of({
  version: '0.22.2:3',
  releaseNotes: {
    en_US: `Block templates are filled by fee from the first byte.

Bitcoin Cash Daemon reserved the start of every block template for "high-priority" transactions and, with no minimum block size, could hand mining pools near-empty templates while a backlog of paying transactions waited. Templates now include transactions by fee rate throughout, so low-fee transactions and long unconfirmed chains are no longer left out.

Also included: Blockchain Sync no longer reports Synced while the node is still catching up, and the Runtime Info action reads sync progress the same way.`,
    es_ES: `Las plantillas de bloque se llenan por comisión desde el primer byte.

Bitcoin Cash Daemon reservaba el inicio de cada plantilla de bloque para transacciones «de alta prioridad» y, sin tamaño mínimo de bloque, podía entregar a los pools de minería plantillas casi vacías mientras esperaba una cola de transacciones que pagaban comisión. Ahora las plantillas incluyen las transacciones por tasa de comisión en todo momento, así que las de comisión baja y las cadenas largas sin confirmar ya no quedan fuera.

También incluido: «Sincronización de la cadena» ya no indica Sincronizado mientras el nodo aún se pone al día, y la acción «Información de ejecución» calcula el progreso de la misma forma.`,
    de_DE: `Block-Vorlagen werden ab dem ersten Byte nach Gebühr gefüllt.

Bitcoin Cash Daemon reservierte den Anfang jeder Block-Vorlage für Transaktionen „hoher Priorität" und konnte ohne Mindestblockgröße Mining-Pools nahezu leere Vorlagen liefern, während ein Rückstau zahlender Transaktionen wartete. Vorlagen nehmen Transaktionen jetzt durchgehend nach Gebührenrate auf, sodass Transaktionen mit niedriger Gebühr und lange unbestätigte Ketten nicht mehr fehlen.

Außerdem enthalten: „Blockchain-Synchronisierung" meldet nicht mehr Synchronisiert, während der Knoten noch aufholt, und die Aktion „Laufzeitinformationen" ermittelt den Fortschritt auf dieselbe Weise.`,
    pl_PL: `Szablony bloków są wypełniane według opłaty od pierwszego bajtu.

Bitcoin Cash Daemon rezerwował początek każdego szablonu bloku na transakcje „o wysokim priorytecie" i bez minimalnego rozmiaru bloku mógł przekazywać kopalniom niemal puste szablony, podczas gdy czekała kolejka płacących transakcji. Szablony obejmują teraz transakcje według stawki opłaty w całości, więc transakcje z niską opłatą i długie łańcuchy niepotwierdzonych transakcji nie są już pomijane.

Również w tej wersji: „Synchronizacja łańcucha" nie pokazuje już Zsynchronizowano, gdy węzeł wciąż nadrabia zaległości, a akcja „Informacje o działaniu" liczy postęp w ten sam sposób.`,
    fr_FR: `Les modèles de bloc sont remplis par frais dès le premier octet.

Bitcoin Cash Daemon réservait le début de chaque modèle de bloc aux transactions « haute priorité » et, sans taille de bloc minimale, pouvait fournir aux pools de minage des modèles presque vides alors qu'une file de transactions payantes attendait. Les modèles incluent désormais les transactions par taux de frais sur toute leur longueur : les transactions à faibles frais et les longues chaînes non confirmées ne sont plus laissées de côté.

Également inclus : « Synchronisation de la chaîne » n'indique plus Synchronisé alors que le nœud rattrape encore son retard, et l'action « Informations d'exécution » calcule la progression de la même façon.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: ALLOW_DOWNGRADE ? async () => {} : IMPOSSIBLE,
  },
})
