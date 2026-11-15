import type { DemoContent } from './index'

// Pages légales (SOC-08). Textes d'exemple : l'association fournit les vrais.

export const legalNotice: DemoContent['page.mentions-legales'] = {
  title: 'Mentions légales',
  text: '<h3>Éditeur du site</h3>'
    + '<p>Association Horizon Cévennes, association loi 1901.<br>Siège : place de la mairie, 30160 Bessèges.<br>Directeur de la publication : le président de l’association.</p>'
    + '<h3>Hébergement</h3>'
    + '<p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>'
    + '<h3>Propriété intellectuelle</h3>'
    + '<p>Les textes et photos de ce site appartiennent à l’association ou à leurs auteurs. Toute reproduction nécessite une autorisation.</p>',
  seo: { title: '', description: '' },
}

export const privacy: DemoContent['page.confidentialite'] = {
  title: 'Politique de confidentialité',
  text: '<h3>Données collectées</h3>'
    + '<p>Ce site ne dépose <strong>aucun cookie</strong>. La mesure d’audience (Umami, auto-hébergé) est anonyme.</p>'
    + '<h3>Inscriptions</h3>'
    + '<p>Les inscriptions sont gérées par une plateforme externe, soumise à sa propre politique de confidentialité.</p>'
    + '<h3>Contact</h3>'
    + '<p>Pour toute question : <a href="mailto:contact@trail-besseges.fr">contact@trail-besseges.fr</a>.</p>',
  seo: { title: '', description: '' },
}
