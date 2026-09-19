import { calculateDeliveryPrice } from './src/services/pricing';

const testCases = [
  { distanceKm: 5, passengers: 2, expected: 40000 },
  { distanceKm: 5, passengers: 3, expected: 50000 },
  { distanceKm: 5, passengers: 4, expected: 55000 },
  { distanceKm: 10, passengers: 6, expected: 90000 },
  { distanceKm: 11, passengers: 2, expected: 70000 },
  { distanceKm: 15, passengers: 3, expected: 115000 },
  { distanceKm: 15, passengers: 4, expected: 125000 },
  { distanceKm: 15, passengers: 5, expected: 135000 },
  { distanceKm: 15, passengers: 6, expected: 145000 }
];

let allPassed = true;

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  const distanceInMeters = tc.distanceKm * 1000;
  
  const pricing = calculateDeliveryPrice(distanceInMeters, 0, {
    category: 'car_ojek',
    passengerCount: tc.passengers
  });

  const passed = pricing.totalDeliveryFee === tc.expected;
  if (!passed) allPassed = false;

  console.log(`Test ${i+1}: ${tc.distanceKm}km, ${tc.passengers} penumpang => Expected: ${tc.expected}, Actual: ${pricing.totalDeliveryFee} - ${passed ? 'PASSED' : 'FAILED'}`);
}

console.log(`FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
