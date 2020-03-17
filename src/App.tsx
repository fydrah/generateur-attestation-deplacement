import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import {
  Input,
  AutoComplete,
  Select,
  Button,
  Typography,
  DatePicker
} from 'antd';
import SignaturePad from 'signature_pad';
import * as R from 'ramda';
import PlacesAutocomplete from 'react-places-autocomplete';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

import 'antd/dist/antd.css';
import './App.css';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const schema = yup.object().shape({
  name: yup.string(),
  birthDay: yup.string(),
  address: yup.string(),
  purpose: yup.string(),
  signature: yup.string()
});

const PURPOSES = [
  {
    label: 'Pro',
    value:
      'déplacements entre le domicile et le lieu d’exercice de l’activité professionnelle, lorsqu’ils sont indispensables à l’exercice d’activités ne pouvant être organisées sous forme de télétravail (sur justificatif permanent) ou déplacements professionnels ne pouvant être différés'
  },
  {
    label: 'Achats de première nécessité',
    value:
      'déplacements pour effectuer des achats de première nécessité dans des établissements autorisés'
  },
  { label: 'Santé', value: 'déplacements pour motif de santé' },
  {
    label: 'Famille',
    value:
      'déplacements pour motif familial impérieux, pour l’assistance aux personnes vulnérables ou la garde d’enfants'
  },
  {
    label: 'Sport',
    value:
      'déplacements brefs, à proximité du domicile, liés à l’activité physique individuelle des personnes, à l’exclusion de toute pratique sportive collective, et aux besoins des animaux de compagnie'
  }
];

const { Option } = Select;
const { Title } = Typography;

function App() {
  const [addr, setAddr] = useState<any>('');
  const [signaturePad, setSignaturePad] = useState<any>(undefined);
  const { register, handleSubmit, errors, control, setValue } = useForm({
    validationSchema: schema
  });

  const dateFormat = 'DD/MM/YYYY';

  const generatePdf = ({
    name,
    birthDay,
    address,
    purpose,
    signature
  }: any) => {
    const date = dayjs().format('DD/MM/YYYY');
    const formattedBirthDay = dayjs(birthDay).format('DD/MM/YYYY');
    const textIdentity = `Je soussigné(e) ${name}, né(e) le ${formattedBirthDay}, demeurant au ${address}, certifie me rendre à l'éxterieur pour le motif: ${purpose}`;
    const textSignature = `Le ${date}`;

    const doc = new jsPDF();

    const FONT_SIZE_BIG = 20;
    const FONT_SIZE_MED = 15;
    const FONT_SIZE_SM = 10;
    const MAX_WIDTH = doc.internal.pageSize.width - 100;
    const MAX_HEIGHT = doc.internal.pageSize.height - 100;

    doc.setFontSize(FONT_SIZE_BIG);
    // doc.text(35, 25, 'Paranyan loves jsPDF');
    doc.text(
      'ATTESTATION DE DÉPLACEMENT DÉROGATOIRE',
      doc.internal.pageSize.width / 2,
      40,
      null,
      null,
      'center'
    );

    doc.setFontSize(FONT_SIZE_SM);

    doc.text(
      doc.splitTextToSize(
        'En application de l’article 1er du décret du 16 mars 2020 portant réglementation des déplacements dans le cadre de la lutte contre la propagation du virus Covid-19',
        MAX_WIDTH
      ),
      doc.internal.pageSize.width / 2,
      50,
      null,
      null,
      'center'
    );

    doc.setFontSize(FONT_SIZE_MED);
    doc.text(
      doc.splitTextToSize(textIdentity, MAX_WIDTH),
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height / 2 - 50,
      null,
      null,
      'center'
    );

    doc.setFontSize(FONT_SIZE_SM);

    doc.text(
      [textSignature],
      doc.internal.pageSize.width - 50,
      doc.internal.pageSize.height - 110,
      null,
      null,
      'center'
    );

    doc.addImage(
      signature,
      'PNG',
      doc.internal.pageSize.width - 70,
      doc.internal.pageSize.height - 100,
      50,
      0
    );
    doc.save('attestation-deplacement.pdf');
  };

  const onSubmit = (values: any) => {
    const signature: string = signaturePad.toDataURL();

    generatePdf({
      name: R.pathOr('')(['name'])(values),
      birthDay: R.pathOr('')(['birthDay'])(values),
      address: R.pathOr('')(['address'])(values),
      purpose: R.pathOr('')(['purpose'])(values),
      signature
    });
  };

  const handleChangeAddr = (address: any) => {
    setAddr(address);
  };

  useEffect(() => {
    const canvas = document.querySelector('canvas');

    setSignaturePad(new SignaturePad(canvas as any));
  }, []);

  return (
    <div className="App">
      <Title className="title">Générateur d'attestation de déplacement</Title>
      <form className="Form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          as={<Input placeholder="Nom" name="name" />}
          control={control}
          name="name"
        />

        <Controller
          as={
            // <Input placeholder="Date de naissance" name="birthDay" />
            <DatePicker
              placeholder="Date de naissance"
              name="birthDay"
              format={dateFormat}
              // onChange={(date: any, dateString: any) => {
              //   console.log('birthDay', dateString);

              //   setValue('birthDay', dateString);
              // }}
            />
          }
          control={control}
          name="birthDay"
        />

        <Controller
          as={
            <PlacesAutocomplete value={addr} onChange={handleChangeAddr}>
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading
              }) => (
                <AutoComplete
                  onSelect={(value: any) => {
                    setValue('address', value);
                  }}
                  options={suggestions.map(each => ({
                    value: each.description
                  }))}
                >
                  <Input
                    {...getInputProps({
                      placeholder: 'Adresse'
                    })}
                  />
                </AutoComplete>
              )}
            </PlacesAutocomplete>
          }
          control={control}
          name="address"
        />

        <Controller
          as={
            <Select
              placeholder="Motif"
              style={{ width: 120 }}
              // onChange={handleChange}
            >
              {PURPOSES.map((each, index) => (
                <Option key={index} value={each.value}>
                  {each.label}
                </Option>
              ))}
            </Select>
          }
          control={control}
          name="purpose"
        ></Controller>

        <span className="label">Signature:</span>
        <canvas></canvas>

        <Button type="primary" htmlType="submit">
          Générer PDF
        </Button>
      </form>

      <span className="footerText">
        Confinez-vous bien et sortez couvert 😷{' '}
      </span>

      <span className="footerText warning">
        Les données personnelles ne sont pas collectées.
        <br />
        ⚠️ Je ne connais pas la valeur juridique du document générée
      </span>

      <a
        className="link"
        href="https://github.com/gmpetrov/generateur-attestation-deplacement"
        target="_blank"
      >
        code source
      </a>

      <a className="link" href="mailto:georges@cool.ovh">
        contact
      </a>
    </div>
  );
}

export default App;
