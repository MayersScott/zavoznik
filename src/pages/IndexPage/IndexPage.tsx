import { useState, useEffect, FC } from 'react';
import { Section, Cell, Image, List, Button } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initDataUnsafe: any;
        openInvoice: (link: string) => void;
        onEvent: (event: string, cb: (data: any) => void) => void;
      };
    };
    client: any;
  }
}

export const IndexPage: FC = () => {
  const [gifts, setGifts] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadGifts() {
      const res = await window.client.invoke({
        '@type': 'payments.getStarGifts',
        hash: 0
      });
      setGifts(res.gifts);
    }
    loadGifts();

    window.Telegram.WebApp.onEvent('invoice_closed', ({ status }) => {
      if (status === 'paid') {
        alert('Спасибо! 🎉');
      }
    });
  }, []);

  const me = window.Telegram.WebApp.initDataUnsafe?.user;

  async function buyGift(giftId: number) {
    if (!me) return;
    const form = await window.client.invoke({
      '@type': 'payments.getPaymentForm',
      invoice: {
        '@type': 'inputInvoiceStarGift',
        user_id: me,
        gift_id: giftId,
        message: { '@type': 'textEmpty' },
        hide_name: false
      }
    });
    window.Telegram.WebApp.openInvoice(form.url);
  }

  return (
    <Page back={false}>
      <List>
        <Section header="Подарки на Stars">
          {gifts.map(g => (
            <Cell
              key={g.id}
              before={<Image src={g.sticker.thumbs[0].url} />}
              subtitle={`${g.stars} Stars${g.sold_out ? ' • (распродано)' : ''}`}
              after={
                <Button disabled={g.sold_out} onClick={() => buyGift(g.id)}>
                  Купить
                </Button>
              }
            >
              🎁 Подарок #{g.id}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};
