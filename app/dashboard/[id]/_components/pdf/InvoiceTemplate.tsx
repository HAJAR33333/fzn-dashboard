import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Création des styles (proche du design de ton dashboard)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1E293B',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  table: {
    marginTop: 20,
    width: 'auto',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    padding: 8,
  },
  colDescription: { width: '60%', fontSize: 10 },
  colQty: { width: '15%', fontSize: 10, textAlign: 'center' },
  colPrice: { width: '25%', fontSize: 10, textAlign: 'right' },
  totalSection: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5', // Indigo-600
  }
});

interface Props {
  data: any; // Tu peux typer plus précisément avec ton modèle Prisma
}

const InvoiceTemplate = ({ data }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{data.type}</Text>
          <Text style={{ fontSize: 10, color: '#64748B' }}>N° {data.numero}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.value}>FZN DASHBOARD</Text>
          <Text style={{ fontSize: 9 }}>Le {new Date(data.createdAt).toLocaleDateString('fr-FR')}</Text>
        </View>
      </View>

      {/* CLIENT & EMETTEUR */}
      <View style={styles.infoSection}>
        <View>
          <Text style={styles.label}>Destinataire</Text>
          <Text style={styles.value}>{data.client?.nom}</Text>
          <Text style={{ fontSize: 10 }}>{data.client?.email}</Text>
        </View>
      </View>

      {/* TABLEAU DES LIGNES */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Désignation</Text>
          <Text style={styles.colQty}>Qté</Text>
          <Text style={styles.colPrice}>Prix Unitaire</Text>
        </View>

        {/* On boucle sur les lignes si elles existent */}
        {data.lignes?.map((ligne: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDescription}>{ligne.designation}</Text>
            <Text style={styles.colQty}>{ligne.quantite}</Text>
            <Text style={styles.colPrice}>{ligne.prixUnitaire.toLocaleString('fr-FR')} €</Text>
          </View>
        ))}
      </View>

      {/* TOTAL */}
      <View style={styles.totalSection}>
        <Text style={styles.label}>Montant Total HT</Text>
        <Text style={styles.totalAmount}>{data.montantHT.toLocaleString('fr-FR')} €</Text>
      </View>

      <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94A3B8', textAlign: 'center' }}>
        Ce document est édité numériquement par votre logiciel FZN.
      </Text>
    </Page>
  </Document>
);

export default InvoiceTemplate;