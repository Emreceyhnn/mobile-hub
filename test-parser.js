const text = "```json\n{\n  \"name\": \"Yiyecek Bulunamadı\",\n  \"calories\": 0,\n  \"protein\": 0.0,\n  \"carbs\": 0.0,\n  \"fat\": 0.0,\n  \"fiber\": 0.0,\n  \"servingSize\": \"N/A\",\n  \"confidence\": \"none\"\n}\n```";
const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
console.log(cleaned);
try {
  JSON.parse(cleaned);
  console.log("Success");
} catch(e) {
  console.error(e);
}
