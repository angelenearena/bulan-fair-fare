import { collection, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Official fare matrix from Municipal Ordinance No. 2022-21
 * All fares are for the Php 60.00–69.00 fuel price range (current standard).
 * Discounts: Student 20% (RA 11314), Senior 20% (RA 9994), PWD 20% (RA 10754)
 *
 * Origin for all routes: Bulan Poblacion (Terminal)
 */

interface RawRoute {
  destination: string;
  distance_km: number;
  regular: number;
  description?: string;
}

function withDiscounts(regular: number) {
  return {
    regular,
    student: Math.round(regular * 0.80 * 100) / 100,
    senior: Math.round(regular * 0.80 * 100) / 100,
    pwd: Math.round(regular * 0.80 * 100) / 100,
  };
}

const OFFICIAL_ROUTES: RawRoute[] = [
  // Within Poblacion
  { destination: "Poblacion (Zone 1–8, Aquino, Libertad, Obrero, Managanag)", distance_km: 0, regular: 9, description: "Internal Poblacion zone routes" },

  // Alphabetical routes
  { destination: "Abad Santos", distance_km: 9.0, regular: 35 },
  { destination: "A. Bonifacio", distance_km: 3.5, regular: 19 },
  { destination: "Antipolo", distance_km: 7, regular: 23 },
  { destination: "Beguin", distance_km: 6, regular: 35 },
  { destination: "Bical", distance_km: 11, regular: 45 },
  { destination: "Bliss", distance_km: 3, regular: 15 },
  { destination: "Bonga", distance_km: 17.5, regular: 44 },
  { destination: "Butag", distance_km: 12, regular: 45 },
  { destination: "Cadandanan", distance_km: 13, regular: 45 },
  { destination: "Calomagon", distance_km: 5.5, regular: 25 },
  { destination: "Calpi", distance_km: 12, regular: 33 },
  { destination: "Cocokabitan", distance_km: 14.5, regular: 65 },
  { destination: "Daganas", distance_km: 16, regular: 45 },
  { destination: "Danao", distance_km: 17, regular: 50 },
  { destination: "Dolos", distance_km: 14, regular: 37 },
  { destination: "E. Quirino", distance_km: 11, regular: 31 },
  { destination: "Fabrica", distance_km: 3, regular: 15 },
  { destination: "G. Del Pilar", distance_km: 5.5, regular: 20 },
  { destination: "Gate (Baba)", distance_km: 14, regular: 45 },
  { destination: "Gate (Itaas)", distance_km: 12, regular: 33 },
  { destination: "ICS", distance_km: 3, regular: 15 },
  { destination: "Inararan", distance_km: 3.5, regular: 18 },
  { destination: "J.P. Laurel (Centro)", distance_km: 1, regular: 11 },
  { destination: "J.P. Laurel (Tahimik)", distance_km: 2, regular: 12 },
  { destination: "Jamorawon", distance_km: 7.5, regular: 22 },
  { destination: "Lajong", distance_km: 5.3, regular: 20 },
  { destination: "Sitio Pawa / ICS", distance_km: 3, regular: 12 },
  { destination: "M. Roxas", distance_km: 8, regular: 40 },
  { destination: "Magsaysay", distance_km: 7, regular: 23 },
  { destination: "Magsaysay (Sitio Kamilan)", distance_km: 9, regular: 33 },
  { destination: "Monte-Calvario", distance_km: 9, regular: 45 },
  { destination: "N. Roque", distance_km: 7, regular: 25 },
  { destination: "Nasuje", distance_km: 5.5, regular: 45 },
  { destination: "Namo", distance_km: 14, regular: 45 },
  { destination: "Otavi", distance_km: 7, regular: 30 },
  { destination: "Oyango", distance_km: 1, regular: 10 },
  { destination: "Padre Diaz", distance_km: 12, regular: 65 },
  { destination: "Palale", distance_km: 9, regular: 35 },
  { destination: "Pinaradan", distance_km: 14, regular: 37 },
  { destination: "Recto", distance_km: 10, regular: 29 },
  { destination: "San Francisco", distance_km: 7, regular: 23 },
  { destination: "San Isidro (Highway)", distance_km: 8, regular: 25 },
  { destination: "San Isidro", distance_km: 9, regular: 35 },
  { destination: "San Juan Bago", distance_km: 5, regular: 25 },
  { destination: "San Juan Daan", distance_km: 10, regular: 45 },
  { destination: "San Rafael", distance_km: 4.5, regular: 28 },
  { destination: "San Ramon", distance_km: 8, regular: 25 },
  { destination: "San Vicente", distance_km: 1, regular: 10 },
  { destination: "Somagongso ng", distance_km: 3, regular: 15 },
  { destination: "Sta. Remedios", distance_km: 2.5, regular: 24 },
  { destination: "Sta. Teresita", distance_km: 13, regular: 45 },
  { destination: "Sigad", distance_km: 6, regular: 21 },
  { destination: "Taromata", distance_km: 10.5, regular: 45 },
  { destination: "Terminal-Pier", distance_km: 4, regular: 17 },
  { destination: "Terminal-Poblacion", distance_km: 2.5, regular: 12 },
];

const ORIGIN = "Bulan Poblacion (Terminal)";

export async function seedTariffs(onProgress?: (msg: string) => void): Promise<number> {
  // Check if already seeded
  const existing = await getDocs(collection(db, "tariffs"));
  if (!existing.empty) {
    onProgress?.(`Replacing ${existing.size} existing tariff(s) with official data...`);
    // Delete existing
    const deleteBatch = writeBatch(db);
    existing.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();
  }

  // Write in batches of 500 (Firestore limit)
  const BATCH_SIZE = 490;
  let count = 0;
  let batch = writeBatch(db);

  for (const route of OFFICIAL_ROUTES) {
    const ref = doc(collection(db, "tariffs"));
    batch.set(ref, {
      origin: ORIGIN,
      destination: route.destination,
      distance_km: route.distance_km,
      fares: withDiscounts(route.regular),
      body_numbers: [],
      description: route.description ?? `Route from Bulan Poblacion to ${route.destination} per Municipal Ordinance No. 2022-21`,
      ordinance: "Municipal Ordinance No. 2022-21",
      fuel_range: "₱60.00–₱69.00",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      onProgress?.(`Uploaded ${count} routes...`);
      batch = writeBatch(db);
    }
  }

  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
  }

  onProgress?.(`Done! ${count} official routes loaded.`);
  return count;
}
