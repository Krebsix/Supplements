import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { hasFormulaChanged } from "./formulaVersioning.ts";

Deno.test("identische Zutatenliste: keine Aenderung", () => {
  const a = {
    ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }],
    dosage: { amount: "1", unit: "Kapsel" },
  };
  const b = {
    ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }],
    dosage: { amount: "1", unit: "Kapsel" },
  };
  assertEquals(hasFormulaChanged(a, b), false);
});

Deno.test("andere Reihenfolge derselben Zutaten: keine Aenderung", () => {
  const a = {
    ingredients: [
      { name: "Vitamin D3", amount: "20", unit: "µg" },
      { name: "Vitamin K2", amount: "75", unit: "µg" },
    ],
  };
  const b = {
    ingredients: [
      { name: "Vitamin K2", amount: "75", unit: "µg" },
      { name: "Vitamin D3", amount: "20", unit: "µg" },
    ],
  };
  assertEquals(hasFormulaChanged(a, b), false);
});

Deno.test("Zahlenschreibweise 300 vs 300.0 vs 300,0: keine Aenderung", () => {
  const a = { ingredients: [{ name: "Zink", amount: "10", unit: "mg" }] };
  const b = { ingredients: [{ name: "Zink", amount: "10,0", unit: "mg" }] };
  const c = { ingredients: [{ name: "Zink", amount: "10.0", unit: "mg" }] };
  assertEquals(hasFormulaChanged(a, b), false);
  assertEquals(hasFormulaChanged(a, c), false);
});

Deno.test("Gross-/Kleinschreibung und Leerzeichen: keine Aenderung", () => {
  const a = { ingredients: [{ name: "  Magnesium  ", amount: "300", unit: "MG" }] };
  const b = { ingredients: [{ name: "magnesium", amount: "300", unit: "mg" }] };
  assertEquals(hasFormulaChanged(a, b), false);
});

Deno.test("geaenderte Menge: Aenderung erkannt", () => {
  const a = { ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }] };
  const b = { ingredients: [{ name: "Magnesiumcitrat", amount: "400", unit: "mg" }] };
  assertEquals(hasFormulaChanged(a, b), true);
});

Deno.test("zusaetzliche Zutat: Aenderung erkannt", () => {
  const a = { ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }] };
  const b = {
    ingredients: [
      { name: "Magnesiumcitrat", amount: "300", unit: "mg" },
      { name: "Vitamin B6", amount: "5", unit: "mg" },
    ],
  };
  assertEquals(hasFormulaChanged(a, b), true);
});

Deno.test("fehlende Zutat: Aenderung erkannt", () => {
  const a = {
    ingredients: [
      { name: "Magnesiumcitrat", amount: "300", unit: "mg" },
      { name: "Vitamin B6", amount: "5", unit: "mg" },
    ],
  };
  const b = { ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }] };
  assertEquals(hasFormulaChanged(a, b), true);
});

Deno.test("geaenderte Dosierung bei gleichen Zutaten: Aenderung erkannt", () => {
  const a = {
    ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }],
    dosage: { amount: "1", unit: "Kapsel" },
  };
  const b = {
    ingredients: [{ name: "Magnesiumcitrat", amount: "300", unit: "mg" }],
    dosage: { amount: "2", unit: "Kapsel" },
  };
  assertEquals(hasFormulaChanged(a, b), true);
});

Deno.test("fehlender previous- oder next-Wert: konservativ keine Aenderung", () => {
  assertEquals(hasFormulaChanged(null, { ingredients: [] }), false);
  assertEquals(hasFormulaChanged({ ingredients: [] }, null), false);
  assertEquals(hasFormulaChanged(undefined, undefined), false);
});

Deno.test("beide ohne Zutatenliste und ohne Dosierung: keine Aenderung", () => {
  assertEquals(hasFormulaChanged({}, {}), false);
});

Deno.test("leere Zutat (weder Name noch Menge noch Einheit) zaehlt nicht mit", () => {
  const a = { ingredients: [{ name: "Magnesium", amount: "300", unit: "mg" }, {}] };
  const b = { ingredients: [{ name: "Magnesium", amount: "300", unit: "mg" }] };
  assertEquals(hasFormulaChanged(a, b), false);
});
