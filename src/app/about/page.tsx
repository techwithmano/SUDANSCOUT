
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Shield, Users, Building, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/context/LanguageContext';
import { Separator } from '@/components/ui/separator';

const offices = [
  { nameKey: 'officeSecretariat', members: ['ربا حيدر محمد', ' رهف مهدي ميرغني'] },
  { nameKey: 'officePrograms', members: ['محمد سامي', 'ماجدة عبدالله عبيد', 'روان ولي الدين'] },
  { nameKey: 'officeTraining', members: ['مأمون سعيد المهدي'] },
  { nameKey: 'officeMedia', members: ['عثمان هارون', 'عبدالرحمن خوجلي عابدين'] },
  { nameKey: 'officeFinance', members: ['إيمان المليح ابراهيم', 'بسملة ايهاب'] },
  { nameKey: 'officeCustodian', members: ['هويده حمدتو محمد', 'رتاج حيدر محمد'] },
  { nameKey: 'officeCommunityService', members: ['مها شمس الفلاح', 'يمنى الطاهر امين'] },
];

let personId = 0;
const leadership = {
  command: [
    {
      id: ++personId,
      name: 'مهدي ميرغني ليلي',
      role: 'roleChairman',
      imageUrl: '/1.png',
      dataAiHint: 'portrait man formal',
    },
    {
      id: ++personId,
      name: 'محمد يحيى',
      role: 'roleFirstHonoraryLeader',
      imageUrl: '/2.png',
      dataAiHint: 'portrait man senior',
    },
    {
      id: ++personId,
      name: 'مأمون سعيد المهدي',
      role: 'roleSecondGroupLeader',
      imageUrl: '/3.png',
      dataAiHint: 'portrait man professional',
    },
  ],
  troops: [
    {
      troopNameKey: 'troopAdvanced',
      leaders: [
        {
          id: ++personId,
          name: 'عثمان هارون',
          role: 'roleTroopLeader',
          imageUrl: '/4.png',
          dataAiHint: 'portrait man beard',
        },
      ],
      assistants: [
        { id: ++personId, name: 'محمد حسن محمد', role: 'roleTroopAssistant', imageUrl: '/5.png', dataAiHint: 'portrait man' },
        { id: ++personId, name: 'عبدالرحمن خوجلي عابدين', role: 'roleTroopAssistant', imageUrl: '/6.png', dataAiHint: 'portrait man professional' },
      ],
    },
    {
      troopNameKey: 'troopBoyScouts',
      leaders: [
        {
          id: ++personId,
          name: 'محمد سامي',
          role: 'roleTroopLeader',
          imageUrl: '/7.png',
          dataAiHint: 'portrait man serious',
        },
      ],
      assistants: [
        { id: ++personId, name: 'امجد مهدي مرغني', role: 'roleTroopAssistant', imageUrl: '/8.png', dataAiHint: 'portrait man glasses' },
      ],
    },
    {
      troopNameKey: 'troopCubScouts',
      leaders: [
        {
          id: ++personId,
          name: 'مازن صبري حسن',
          role: 'roleTroopLeader',
          imageUrl: '/9.png',
          dataAiHint: 'portrait man smiling',
        },
      ],
      assistants: [
        { id: ++personId, name: 'عثمان عماد الدين', role: 'roleTroopAssistant', imageUrl: '/10.png', dataAiHint: 'portrait man' },
      ],
    },
    {
      troopNameKey: 'troopAdvancedGuides',
      leaders: [
        {
          id: ++personId,
          name: 'ماجدة عبدالله عبيد',
          role: 'roleFemaleTroopLeader',
          imageUrl: '/11.png',
          dataAiHint: 'portrait woman',
        },
        {
          id: ++personId,
          name: 'مها شمس الفلاح',
          role: 'roleFemaleTroopLeader',
          imageUrl: '/12.png',
          dataAiHint: 'portrait woman serious',
        },
      ],
      assistants: [
        { id: ++personId, name: 'روان ولي الدين', role: 'roleFemaleTroopAssistant', imageUrl: '/13.png', dataAiHint: 'portrait woman young' },
      ],
    },
    {
      troopNameKey: 'troopGirlGuides',
      leaders: [
        {
          id: ++personId,
          name: 'إيمان المليح ابراهيم',
          role: 'roleFemaleTroopLeader',
          imageUrl: '/14.png',
          dataAiHint: 'portrait woman professional',
        },
      ],
      assistants: [
        { id: ++personId, name: 'رتاج حيدر محمد', role: 'roleFemaleTroopAssistant', imageUrl: '/15.png', dataAiHint: 'portrait woman' },
        { id: ++personId, name: 'يمنى الطاهر امين', role: 'roleFemaleTroopAssistant', imageUrl: '/16.png', dataAiHint: 'portrait woman glasses' },
      ],
    },
    {
      troopNameKey: 'troopBrownies',
      leaders: [
        {
          id: ++personId,
          name: 'خديجة ابوبكر هارون',
          role: 'roleFemaleTroopLeader',
          imageUrl: '/17.png',
          dataAiHint: 'portrait woman smiling',
        },
      ],
      assistants: [
        { id: ++personId, name: 'بسملة ايهاب', role: 'roleFemaleTroopAssistant', imageUrl: '/18.png', dataAiHint: 'portrait woman young' },
        { id: ++personId, name: 'رهف مهدي ميرغني', role: 'roleFemaleTroopAssistant', imageUrl: '/19.png', dataAiHint: 'portrait woman young' },
      ],
    },
  ],
};


const LeaderCard = ({ person, t }: { person: any, t: any }) => (
  <Card className="text-center shadow-lg w-full">
    <CardContent className="pt-6">
      <Avatar className="h-24 w-24 mx-auto border-4 border-card shadow-md">
        <AvatarImage src={person.imageUrl} alt={person.name} data-ai-hint={person.dataAiHint} />
        <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <CardTitle className="font-headline mt-4 text-xl">{person.name}</CardTitle>
      <p className="text-primary font-semibold mt-1">{t(`about.${person.role}`)}</p>
      {person.office && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Building className="h-4 w-4" />
          <span>{t('about.office')}: {person.office}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('about.mainTitle')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('about.mainSubtitle')}
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <Image
            src="/message.png"
            alt="A group of diverse scouts smiling"
            width={600}
            height={450}
            className="w-full h-auto object-cover"
            data-ai-hint="diverse scouts"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-headline text-primary">{t('about.missionTitle')}</h2>
          <p className="mt-4 text-muted-foreground">
            {t('about.missionText')}
          </p>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold font-headline text-center text-primary">{t('about.valuesTitle')}</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="items-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline pt-2">{t('about.valueIntegrityTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              {t('about.valueIntegrityText')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline pt-2">{t('about.valueRespectTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              {t('about.valueRespectText')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center">
               <div className="p-3 bg-primary/10 rounded-full">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline pt-2">{t('about.valueExcellenceTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              {t('about.valueExcellenceText')}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold font-headline text-center text-primary">{t('about.committeesTitle')}</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offices.map(office => (
            <Card key={office.nameKey}>
              <CardHeader>
                <div className="flex items-center gap-3">
                   <Briefcase className="h-8 w-8 text-primary" />
                   <CardTitle className="font-headline pt-2">{t(`about.${office.nameKey}`)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="font-semibold">{office.members.join('، ')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-3xl font-bold font-headline text-center text-primary">{t('about.leadersTitle')}</h2>
        
        <div className="mt-8">
            <h3 className="text-2xl font-bold font-headline text-center text-secondary-foreground mb-6">{t('about.commandTitle')}</h3>
            <div className="flex justify-center gap-8 flex-wrap">
              {leadership.command.map(leader => (
                  <div key={leader.id} className="w-full max-w-sm">
                    <LeaderCard person={leader} t={t} />
                  </div>
              ))}
            </div>
        </div>
        
        <Separator className="my-12" />

        <div className="mt-8">
            <h3 className="text-2xl font-bold font-headline text-center text-secondary-foreground mb-8">{t('about.troopsTitle')}</h3>
            <div className="space-y-12">
              {leadership.troops.map(troop => (
                <div key={troop.troopNameKey}>
                  <h4 className="text-xl font-bold font-headline text-center text-primary mb-6">{t(`about.${troop.troopNameKey}`)}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 flex flex-col items-center gap-8">
                      {(troop.leaders || []).map(leader => (
                        <LeaderCard key={leader.id} person={leader} t={t} />
                      ))}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {(troop.assistants || []).map(assistant => (
                        <LeaderCard key={assistant.id} person={assistant} t={t} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>

      </div>
      
      <div className="mt-20 grid md:grid-cols-2 gap-12 items-center">
         <div>
          <h2 className="text-3xl font-bold font-headline text-primary">{t('about.historyTitle')}</h2>
          <p className="mt-4 text-muted-foreground">
            {t('about.historyText')}
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl">
          <Image
            src="/history.png"
            alt="Vintage photo of early scouts"
            width={600}
            height={450}
            className="w-full h-auto object-cover"
            data-ai-hint="vintage scouts"
          />
        </div>
      </div>
    </div>
  );
}

    