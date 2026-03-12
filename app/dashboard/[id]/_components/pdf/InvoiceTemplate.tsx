import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', color: '#1E293B' },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  label: { fontSize: 10, color: '#64748B', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  
  // TABLE STYLES
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    padding: 8,
    alignItems: 'center',
  },
  // Colonnes ajustées pour accueillir Remise et TVA
  colDesc: { width: '40%', fontSize: 9 },
  colQty: { width: '10%', fontSize: 9, textAlign: 'center' },
  colPU: { width: '15%', fontSize: 9, textAlign: 'right' },
  colRemise: { width: '12%', fontSize: 9, textAlign: 'right', color: '#4F46E5' },
  colTVA: { width: '10%', fontSize: 9, textAlign: 'right' },
  colTotalLigne: { width: '13%', fontSize: 9, textAlign: 'right', fontWeight: 'bold' },

  // TOTAL SECTION
  totalSection: {
    marginTop: 30,
    alignItems: 'flex-end',
    gap: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 4,
  },
  totalLabel: { fontSize: 10, color: '#64748B', width: '150pt', textAlign: 'right', marginRight: 10 },
  totalVal: { fontSize: 10, color: '#0F172A', width: '80pt', textAlign: 'right' },
  ttcBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' }
});

const InvoiceTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{data.type}</Text>
          <Text style={{ fontSize: 10, color: '#64748B' }}>N° {data.numero}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.value}>{data.espace?.nom || "FZN DASHBOARD"}</Text>
          <Text style={{ fontSize: 9 }}>Le {new Date(data.createdAt).toLocaleDateString('fr-FR')}</Text>
        </View>
      </View>

      {/* CLIENT */}
      <View style={styles.infoSection}>
        <View>
          <Text style={styles.label}>Destinataire</Text>
          <Text style={styles.value}>{data.client?.nom}</Text>
          <Text style={{ fontSize: 10 }}>{data.client?.adresse}</Text>
          <Text style={{ fontSize: 10 }}>{data.client?.email}</Text>
        </View>
      </View>

      {/* TABLEAU */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Désignation</Text>
          <Text style={styles.colQty}>Qté</Text>
          <Text style={styles.colPU}>PU HT</Text>
          <Text style={styles.colRemise}>Rem.</Text>
          <Text style={styles.colTVA}>TVA</Text>
          <Text style={styles.colTotalLigne}>Total HT</Text>
        </View>

        {data.lignes?.map((ligne: any, index: number) => {
          const totalLigneHT = (ligne.quantite * ligne.prixUnitaire) * (1 - (ligne.remise || 0) / 100);
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{ligne.designation}</Text>
              <Text style={styles.colQty}>{ligne.quantite}</Text>
              <Text style={styles.colPU}>{ligne.prixUnitaire.toFixed(2)}€</Text>
              <Text style={styles.colRemise}>{ligne.remise > 0 ? `-${ligne.remise}%` : '-'}</Text>
              <Text style={styles.colTVA}>{ligne.tva}%</Text>
              <Text style={styles.colTotalLigne}>{totalLigneHT.toFixed(2)}€</Text>
            </View>
          );
        })}
      </View>

      {/* BLOC TOTAUX */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL NET HT</Text>
          <Text style={styles.totalVal}>{data.montantHT.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>MONTANT TVA</Text>
          <Text style={styles.totalVal}>{data.montantTVA.toFixed(2)} €</Text>
        </View>
        <View style={styles.ttcBox}>
          <Text style={[styles.totalLabel, { color: '#4F46E5', fontWeight: 'bold', fontSize: 12 }]}>TOTAL TTC</Text>
          <Text style={styles.totalAmount}>{data.totalTTC.toFixed(2)} €</Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94A3B8', textAlign: 'center' }}>
        {data.espace?.nom} - Document généré par FZN Dashboard
      </Text>
    </Page>
  </Document>
);

export default InvoiceTemplate;