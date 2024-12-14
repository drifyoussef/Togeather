const licenseChecker = require('license-checker');
const fs = require('fs');
const path = require('path');

// Charger les dépendances déclarées directement dans package.json
const packageJson = require(path.join(__dirname, 'package.json'));
const directDependencies = Object.keys(packageJson.dependencies || {});

licenseChecker.init(
  {
    start: __dirname,
    json: true,
  },
  function (err, packages) {
    if (err) {
      console.error('Error fetching licenses:', err);
    } else {
      // Filtrer uniquement les dépendances directes
      const filteredPackages = Object.fromEntries(
        Object.entries(packages).filter(([packageName]) =>
          directDependencies.some((dep) => packageName.startsWith(dep))
        )
      );

      // Sauvegarder les résultats dans un fichier JSON
      const outputPath = path.join(__dirname, 'backend-licenses.json');
      fs.writeFileSync(outputPath, JSON.stringify(filteredPackages, null, 2));
      console.log(`Licenses saved to ${outputPath}`);
    }
  }
);
