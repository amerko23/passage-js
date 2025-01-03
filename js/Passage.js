const PassageJs = (function () {
  'use strict';
  const passage = document.querySelector("script[data-name='valor_passage']");
  const valorFieldsDiv = document.getElementById('valor-fields');
  const sessionExpiryMinutes = 5;
  const valorLogoUrl = 'https://developer.valorpaytech.com/images/logo.png';
  const demoValorUrl = 'https://securelink-staging.valorpaytech.com:4430';
  const liveValorUrl = 'https://securelink.valorpaytech.com:4430';
  const currentScriptUrl = passage.src;
  const scriptPath = currentScriptUrl.substring(0, currentScriptUrl.lastIndexOf('/') + 1);
  var baseImageUrl = scriptPath.replace('/js/', '/images/');
  if (!passage || !passage.getAttribute('data-clientToken') || !passage.getAttribute('data-epi') || !valorFieldsDiv) {
    return;
  }
  const passageHtmlJson = [];

  const clientToken = passage.getAttribute('data-clientToken');
  const epi = passage.getAttribute('data-epi');
  const isDemo = passage.getAttribute('data-demo') ? true : false;
  const apiUrl = isDemo ? demoValorUrl : liveValorUrl;
  const cardVariant = passage.getAttribute('data-variant');
  const valorLogo = passage.getAttribute('data-valorLogo');
  const cardHolderName = passage.getAttribute('data-cardholderName');
  const defaultCardholder = passage.getAttribute('data-defaultCardholderName') ? passage.getAttribute('data-defaultCardholderName') : '';
  const email = passage.getAttribute('data-Email');
  const defaultEmail = passage.getAttribute('data-defaultEmail') ?? '';
  const phone = passage.getAttribute('data-Phone');
  const defaultPhone = passage.getAttribute('data-defaultPhone') ?? '';
  const billingAddress = passage.getAttribute('data-billingAddress');
  const addressLine1 = passage.getAttribute('data-defaultAddress1') ?? '';
  const addressLine2 = passage.getAttribute('data-defaultAddress2') ?? '';
  const defaultCity = passage.getAttribute('data-defaultCity') ?? '';
  const defaultState = passage.getAttribute('data-defaultState') ?? '';
  const defaultZip = passage.getAttribute('data-defaultZip') ?? '';
  const submitText = passage.getAttribute('data-submitText') ?? 'Buy Now';

  let passageSubmitButton = null;
  let cardNumInput = null;
  let cardExpInput = null;
  let cardCvvInput = null;
  let phoneInput = null;
  let cardNumberValid = false;
  let cardExpValid = false;
  let cardCvvValid = false;
  let phoneNumberValid = true;
  let cardNumErrorMsg = null;
  let cardExpErrorMsg = null;
  let cardCvvErrorMsg = null;
  let phoneNumErrorMsg = null;
  let cardName = null;

  const submitBg = passage.getAttribute('data-submitBg') ? passage.getAttribute('data-submitBg') : '#005cb9';
  const submitColor = passage.getAttribute('data-submitColor') ? passage.getAttribute('data-submitColor') : '#fff';

  const valorFormCss = `#valor-checkout-form {width: 80%; font-family: 'roboto'} #valor-logo {margin-bottom: 20px;} #valor-logo img {width: 225px;} #valor-checkout-form label {margin-top: 10px; font-family: roboto; font-weight: 500; color: #697386;}
    #valor-checkout-form input, #valor-checkout-form select {display:block; width: 100%; padding: 6px 12px; color: #555; background-color: #fff; background-image: none; outline: none; font-size: 14px; height: 40px; border: 1px solid rgba(60, 66, 87, 0.12); border-radius: 8px; box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);} #valor-checkout-form input:focus, #valor-checkout-form select:focus {border-color: ${submitBg}; box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%), 0 0 8px rgb(102 175 233 / 60%);} #valor-checkout-form input[type="checkbox"] {width: 17px; height: 17px; vertical-align: sub; display: inline-block;}
    .separator {display: flex; align-items: center; text-align: center;} .separator::before, .separator::after {content: ''; flex: 1; border-bottom: 1px solid #000;} .separator:not(:empty)::before {margin-right: .25em;} .separator:not(:empty)::after {margin-left: .25em;} .gpay-button.new_style {border-radius: 4px !important;} .gpay-button.black.short.new_style, .gpay-button.black.plain.new_style {min-width: 250px !important;}
    #cards .d-flex { width: fit-content; position: absolute; top: 10px; right: 5px; } .d-flex span{ margin: 0 5px;} .card_error{ color: red;} button#passage-submit, div#pay-now { font-family: Roboto; color: ${submitColor}; background: ${submitBg}; width: 45%; border-radius: 4px; border: none; box-shadow: 0px -1px 1px rgb(0 0 0 / 12%), 0px 2px 5px rgb(0 0 0 / 12%), 0px 1px 1px rgb(0 0 0 / 8%); margin: 20px 10px 20px 0; padding: 15px 30px;} #cards { position:relative; } #card_fields,#address_ct{display: flex; width: 100%; justify-content: space-between} #exp,#cvv,#passage-city,#passage-state{width: 50%;} #cc-policy a {font-weight: 800; color: ${submitBg};} button#passage-submit[disabled], button#pay-now[disabled] {cursor: not-allowed; opacity: 0.65;} div#passage-cancel {display: inline-block; font-family: Roboto; color: #fff; background: #000; width: 45%; border-radius: 4px; border: none; box-shadow: 0px -1px 1px rgb(0 0 0 / 12%), 0px 2px 5px rgb(0 0 0 / 12%), 0px 1px 1px rgb(0 0 0 / 8%); margin: 20px 10px; padding: 15px 30px; text-align: center; cursor: pointer;} div#pay-now{ cursor: pointer; text-align:center;} .valor-modal{ position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1050; display: none; justify-content: center; align-items: center; background: #0005;} div#passage-popup-inner{ padding: 15px 20px; background: #fff; border-radius: 5px;box-shadow: 0 5px 15px rgb(0 0 0 / 50%);} div#card-popup{width: 600px; margin: 30px auto; position: relative;}
    @media only screen and (max-width: 580px) {#valor-checkout-form {width: 95%; margin: 5% auto;} button#passage-submit, div#pay-now { margin: 20px 0px;} div#card-popup{ margin: 50% 5%;} div#card-popup{width: 400px; margin: 30px auto; position: relative;}} .passage-loader {display: inline-block;width: 20px;height: 20px;border-radius: 50%;border: 3px solid rgba(0, 0, 0, 0.3);border-top-color: #fff;animation: passage-loader 0.6s linear infinite;margin-left: 5px;vertical-align: middle;} @keyframes passage-loader {to {transform: rotate(360deg);}}`;

  function addPassageCss() {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(valorFormCss));
  }
  function lightBoxPopupEvents() {
    document.getElementById('pay-now').addEventListener('click', function () {
      document.getElementById('card-details-popup').classList.add('in');
      document.getElementById('card-details-popup').style.display = 'flex';
      return true;
    });
    document.getElementById('passage-cancel').addEventListener('click', function () {
      document.getElementById('card-details-popup').classList.remove('in');
      document.getElementById('card-details-popup').style.display = 'none';
      return true;
    });
  }
  function buildFormJson() {
    const isAch = passage.getAttribute('data-ach') ? true : false;

    if (isAch) {
      passageHtmlJson.push({
        tag: 'div',
        id: 'payment-toggle',
        style: 'display: flex; gap: 10px; margin-bottom: 20px;', // Flex styling for layout
        children: [
          {
            tag: 'button',
            id: 'card-button',
            type: 'button',
            children: ['CARD'],
            style: `
              background-color: #005cb9; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            `,
          },
          {
            tag: 'button',
            id: 'ach-button',
            type: 'button',
            children: ['ACH'],
            style: `
              background-color: white; 
              color: #005cb9; 
              border: 2px solid #005cb9; 
              border-radius: 5px; 
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            `,
          },
        ],
      });
    }
    if (valorLogo === 'true') {
      passageHtmlJson.push({
        tag: 'div',
        id: 'valor-logo-div',
        children: [
          {
            tag: 'div',
            id: 'valor-logo',
            children: [
              {
                tag: 'img',
                src: valorLogoUrl,
                alt: 'Valor',
              },
            ],
          },
        ],
      });
    }
    const customerInfoSection = {
      tag: 'div',
      id: 'card_options',
      children: [
        {
          tag: 'div',
          id: 'card-details',
          children: [],
        },
      ],
    };
    if (email === 'true') {
      customerInfoSection.children[0].children.push(
        { tag: 'label', id: 'label_email', children: ['Email'] },
        {
          tag: 'input',
          type: 'email',
          name: 'email',
          id: 'cc_email',
          placeholder: 'abc@xyz.com',
          required: '',
          autocomplete: 'email',
          value: defaultEmail,
          maxlength: 255,
        }
      );
    }
    if (phone === 'true') {
      customerInfoSection.children[0].children.push(
        { tag: 'label', id: 'label_phone', children: ['Phone'] },
        {
          tag: 'input',
          type: 'tel',
          name: 'phone',
          id: 'cc_phone',
          placeholder: '(123) 123-1234',
          maxlength: '14',
          autocomplete: 'tel',
          value: defaultPhone,
        },
        {
          tag: 'span',
          class: 'card_error',
          id: 'phone_num_error',
        }
      );
    }
    if (billingAddress === 'true') {
      customerInfoSection.children[0].children.push(
        {
          tag: 'input',
          type: 'text',
          name: 'address1',
          id: 'cc_address',
          placeholder: 'Address line 1',
          value: addressLine1,
          maxlength: 255,
        },
        {
          tag: 'input',
          type: 'text',
          name: 'address2',
          id: 'cc_address_1',
          placeholder: 'Address line 2',
          value: addressLine2,
          maxlength: 255,
        },
        {
          tag: 'div',
          id: 'address_ct',
          children: [
            {
              tag: 'div',
              id: 'passage-city',
              children: [
                {
                  tag: 'input',
                  type: 'text',
                  name: 'city',
                  id: 'cc_city',
                  placeholder: 'City',
                  value: defaultCity,
                  maxlength: 25,
                },
              ],
            },
            {
              tag: 'div',
              id: 'passage-state',
              children: [
                {
                  tag: 'select',
                  id: 'cc_state',
                  name: 'state',
                  children: [
                    [
                      { tag: 'option', value: 'Alabama', children: ['Alabama'] },
                      { tag: 'option', value: 'Alaska', children: ['Alaska'] },
                      { tag: 'option', value: 'Arizona', children: ['Arizona'] },
                      { tag: 'option', value: 'Arkansas', children: ['Arkansas'] },
                      { tag: 'option', value: 'California', children: ['California'] },
                      { tag: 'option', value: 'Colorado', children: ['Colorado'] },
                      { tag: 'option', value: 'Connecticut', children: ['Connecticut'] },
                      { tag: 'option', value: 'Delaware', children: ['Delaware'] },
                      { tag: 'option', value: 'Florida', children: ['Florida'] },
                      { tag: 'option', value: 'Georgia', children: ['Georgia'] },
                      { tag: 'option', value: 'Hawaii', children: ['Hawaii'] },
                      { tag: 'option', value: 'Idaho', children: ['Idaho'] },
                      { tag: 'option', value: 'Illinois', children: ['Illinois'] },
                      { tag: 'option', value: 'Indiana', children: ['Indiana'] },
                      { tag: 'option', value: 'Iowa', children: ['Iowa'] },
                      { tag: 'option', value: 'Kansas', children: ['Kansas'] },
                      { tag: 'option', value: 'Kentucky', children: ['Kentucky'] },
                      { tag: 'option', value: 'Louisiana', children: ['Louisiana'] },
                      { tag: 'option', value: 'Maine', children: ['Maine'] },
                      { tag: 'option', value: 'Maryland', children: ['Maryland'] },
                      { tag: 'option', value: 'Massachusetts', children: ['Massachusetts'] },
                      { tag: 'option', value: 'Michigan', children: ['Michigan'] },
                      { tag: 'option', value: 'Minnesota', children: ['Minnesota'] },
                      { tag: 'option', value: 'Mississippi', children: ['Mississippi'] },
                      { tag: 'option', value: 'Missouri', children: ['Missouri'] },
                      { tag: 'option', value: 'Montana', children: ['Montana'] },
                      { tag: 'option', value: 'Nebraska', children: ['Nebraska'] },
                      { tag: 'option', value: 'Nevada', children: ['Nevada'] },
                      { tag: 'option', value: 'New Hampshire', children: ['New Hampshire'] },
                      { tag: 'option', value: 'New Jersey', children: ['New Jersey'] },
                      { tag: 'option', value: 'New Mexico', children: ['New Mexico'] },
                      { tag: 'option', value: 'New York', children: ['New York'] },
                      { tag: 'option', value: 'North Carolina', children: ['North Carolina'] },
                      { tag: 'option', value: 'North Dakota', children: ['North Dakota'] },
                      { tag: 'option', value: 'Ohio', children: ['Ohio'] },
                      { tag: 'option', value: 'Oklahoma', children: ['Oklahoma'] },
                      { tag: 'option', value: 'Oregon', children: ['Oregon'] },
                      { tag: 'option', value: 'Pennsylvania', children: ['Pennsylvania'] },
                      { tag: 'option', value: 'Rhode Island', children: ['Rhode Island'] },
                      { tag: 'option', value: 'South Carolina', children: ['South Carolina'] },
                      { tag: 'option', value: 'South Dakota', children: ['South Dakota'] },
                      { tag: 'option', value: 'Tennessee', children: ['Tennessee'] },
                      { tag: 'option', value: 'Texas', children: ['Texas'] },
                      { tag: 'option', value: 'Utah', children: ['Utah'] },
                      { tag: 'option', value: 'Vermont', children: ['Vermont'] },
                      { tag: 'option', value: 'Virginia', children: ['Virginia'] },
                      { tag: 'option', value: 'Washington', children: ['Washington'] },
                      { tag: 'option', value: 'West Virginia', children: ['West Virginia'] },
                      { tag: 'option', value: 'Wisconsin', children: ['Wisconsin'] },
                      { tag: 'option', value: 'Wyoming', children: ['Wyoming'] },
                    ],
                  ],
                },
              ],
            },
          ],
        },
        {
          tag: 'input',
          type: 'text',
          name: 'zip_code',
          id: 'cc-zip-code',
          placeholder: 'Zip Code',
          minlength: '4',
          maxlength: '6',
          value: defaultZip,
        }
      );
    }
    //Add card form
    const cardSection = {
      tag: 'div',
      id: 'card-section',
      style: 'display: block;',
      children: [
        { tag: 'label', id: 'card-label', children: ['Card information'] },
        {
          tag: 'div',
          id: 'cards',
          children: [
            {
              tag: 'input',
              type: 'text',
              name: 'cc_num',
              id: 'cc-num',
              placeholder: '4111 1111 1111 1111',
              maxlength: '19',
              required: '',
              autocomplete: 'cc-number',
              inputmode: 'numeric',
            },
            {
              tag: 'div',
              class: 'd-flex',
              id: 'card-icons',
              children: [
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'visa',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_visa.svg' }],
                },
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'amex',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_amex.svg' }],
                },
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'mastercard',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_mastercard.svg' }],
                },
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'discover',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_discover.svg' }],
                },
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'jcb',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_jcb.svg' }],
                },
                {
                  tag: 'span',
                  class: 'card-icon',
                  id: 'diners',
                  children: [{ tag: 'img', src: baseImageUrl + '/ic_diners.png' }],
                },
              ],
            },
            { tag: 'span', class: 'card_error', id: 'card_number_error' },
            {
              tag: 'div',
              id: 'card_fields',
              children: [
                {
                  tag: 'div',
                  class: 'exp_div',
                  id: 'exp',
                  children: [
                    {
                      tag: 'input',
                      type: 'text',
                      name: 'cc_exp',
                      id: 'cc-exp',
                      placeholder: 'MM / YY',
                      maxlength: '7',
                      required: '',
                      autocomplete: 'cc-exp',
                    },
                    {
                      tag: 'span',
                      class: 'card_error',
                      id: 'card_exp_error',
                    },
                  ],
                },
                {
                  tag: 'div',
                  class: 'cvv_div',
                  id: 'cvv',
                  children: [
                    {
                      tag: 'input',
                      type: 'password',
                      name: 'cc_cvv',
                      id: 'cc-cvv',
                      placeholder: 'CVV',
                      maxlength: '3',
                      required: '',
                      autocomplete: 'cc-csc',
                    },
                    {
                      tag: 'span',
                      class: 'card_error',
                      id: 'card_cvv_error',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const achSection = {
      tag: 'div',
      id: 'ach-section',
      style: 'display: none;', // Default hidden
      children: [
        { tag: 'p', children: ['You clicked ACH.'] },
        { tag: 'label', children: ['Account Number'] },
        {
          tag: 'input',
          type: 'text',
          name: 'account_number',
          id: 'account-number',
          placeholder: 'Enter Account Number',
          required: '',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
        },
        { tag: 'label', children: ['Routing Number'] },
        {
          tag: 'input',
          type: 'text',
          name: 'routing_number',
          id: 'routing-number',
          placeholder: 'Enter Routing Number',
          required: '',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
        },
        { tag: 'label', children: ['Name on Account'] },
        {
          tag: 'input',
          type: 'text',
          name: 'account_name',
          id: 'account-name',
          placeholder: 'Enter Name on Account',
          required: '',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
        },
        { tag: 'label', children: ['Account Type'] },
        {
          tag: 'select',
          name: 'account_type',
          id: 'account-type',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
          children: [
            { tag: 'option', value: '', children: ['Select Account Type'] },
            { tag: 'option', value: 'CHECKING', children: ['CHECKING'] },
            { tag: 'option', value: 'SAVINGS', children: ['SAVINGS'] },
          ],
        },
        { tag: 'label', children: ['Entry Class'] },
        {
          tag: 'select',
          name: 'entry_class',
          id: 'entry-class',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
          children: [
            { tag: 'option', value: '', children: ['Select Entry Class'] },
            { tag: 'option', value: 'BUSINESS', children: ['BUSINESS'] },
            { tag: 'option', value: 'PERSONAL', children: ['PERSONAL'] },
          ],
        },
        { tag: 'label', children: ['Transaction Type'] },
        {
          tag: 'select',
          name: 'transaction_type',
          id: 'transaction-type',
          style: `
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
          `,
          children: [
            { tag: 'option', value: '', children: ['Select Transaction Type'] },
            { tag: 'option', value: 'DEBIT', children: ['DEBIT'] },
            { tag: 'option', value: 'CREDIT', children: ['CREDIT'] },
          ],
        },
      ],
    };
    passageHtmlJson.push(achSection);

    const cardHolderNameSec = {
      tag: 'div',
      id: 'card-holder-section',
      children: [
        {
          tag: 'div',
          id: 'card-holder',
          children: [
            { tag: 'label', id: 'label_cardholder', children: ['Name on Card'] },
            {
              tag: 'input',
              type: 'text',
              name: 'cc_name',
              maxlength: '25',
              id: 'cc-name',
              placeholder: 'John Doe',
              required: '',
              autocomplete: 'cc-name',
              value: defaultCardholder,
              pattern: '[\\p{L} \\-\\.]+',
            },
          ],
        },
      ],
    };
    const cardPolicySection = {
      tag: 'div',
      id: 'card-policy-section',
      children: [
        {
          tag: 'div',
          id: 'cc-policy',
          children: [
            {
              tag: 'label',
              id: 'label_policy',
              children: [
                {
                  tag: 'input',
                  type: 'checkbox',
                  name: 'cc-policy',
                  class: 'policy',
                  id: 'cc_policy',
                  required: '',
                },
                {
                  tag: 'span',
                  id: 'policy_text',
                  children: [' I agree to the Valor Payments Terms of Service &amp; '],
                },
              ],
            },
            {
              tag: 'a',
              id: 'privacy_policy',
              href: 'https://valorpaytech.com/privacy-policy/',
              target: '_blank',
              children: [' Privacy Policy. '],
            },
          ],
        },
      ],
    };
    const popupSection = {
      tag: 'div',
      class: 'valor-modal fade',
      id: 'card-details-popup',
      style: 'display: none;',
      children: [
        {
          tag: 'div',
          id: 'card-popup',
          children: [
            {
              tag: 'div',
              id: 'passage-popup-inner',
              children: [],
            },
          ],
        },
      ],
    };
    const popupActions = [
      {
        tag: 'button',
        id: 'passage-submit',
        disabled: '',
        children: [submitText],
      },
      {
        tag: 'div',
        class: 'cancel_button',
        id: 'passage-cancel',
        children: ['Cancel'],
      },
    ];
    if (cardVariant !== 'lightbox') {
      customerInfoSection.children[0].children.push(cardSection);
      if (cardHolderName === 'true') {
        customerInfoSection.children[0].children.push(cardHolderNameSec);
      }
      customerInfoSection.children[0].children.push(cardPolicySection);
      passageHtmlJson.push(customerInfoSection);
      passageHtmlJson.push({
        tag: 'div',
        id: 'card-submit-section',
        children: [
          {
            tag: 'div',
            id: 'passage-actions',
            children: [
              {
                tag: 'button',
                id: 'passage-submit',
                type: 'submit',
                disabled: '',
                children: [submitText],
              },
            ],
          },
        ],
      });
    } else {
      popupSection.children[0].children[0].children.push(cardSection);
      if (cardHolderName === 'true') {
        popupSection.children[0].children[0].children.push(cardHolderNameSec);
      }
      popupSection.children[0].children[0].children.push(cardPolicySection);
      popupSection.children[0].children[0].children.push(...popupActions);
      customerInfoSection.children.push(popupSection);
      passageHtmlJson.push(customerInfoSection);
      passageHtmlJson.push({
        tag: 'div',
        id: 'card-submit-section',
        children: [
          {
            tag: 'div',
            id: 'passage-actions',
            children: [
              {
                tag: 'div',
                class: 'pay-now-popup',
                id: 'pay-now',
                children: ['Pay Now'],
              },
            ],
          },
        ],
      });
    }
  }

  function addToggleEvents() {
    const cardButton = document.getElementById('card-button');
    const achButton = document.getElementById('ach-button');
    const cardSection = document.getElementById('card-section');
    const achSection = document.getElementById('ach-section');
  
    if (cardButton && achButton) {
      cardButton.addEventListener('click', () => {
        // Toggle button styles
        cardButton.style.backgroundColor = '#005cb9';
        cardButton.style.color = 'white';
        cardButton.style.border = 'none';
  
        achButton.style.backgroundColor = 'white';
        achButton.style.color = '#005cb9';
        achButton.style.border = '2px solid #005cb9';
  
        // Show card section and hide ACH section
        cardSection.style.display = 'block';
        achSection.style.display = 'none';
      });
  
      achButton.addEventListener('click', () => {
        // Toggle button styles
        achButton.style.backgroundColor = '#005cb9';
        achButton.style.color = 'white';
        achButton.style.border = 'none';
  
        cardButton.style.backgroundColor = 'white';
        cardButton.style.color = '#005cb9';
        cardButton.style.border = '2px solid #005cb9';
  
        // Show ACH section and hide card section
        cardSection.style.display = 'none';
        achSection.style.display = 'block';
      });
    }
  }

  function submitButtonStatus() {
    if (cardNumberValid === true && cardExpValid === true && cardCvvValid === true && phoneNumberValid === true) {
      passageSubmitButton.disabled = false;
      return;
    }
    passageSubmitButton.disabled = true;
  }
  // Build DOM elements from JSON
  function buildIntoDom(element, obj, useCreateTextNode) {
    if (typeof obj === 'string') {
      if (useCreateTextNode) {
        element.appendChild(document.createTextNode(obj));
      } else {
        element.innerHTML += obj;
      }
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        buildIntoDom(element, obj[i], useCreateTextNode);
      }
    } else {
      const e = document.createElement(obj.tag);
      for (const prop in obj) {
        if (prop !== 'tag') {
          if (prop === 'children') {
            buildIntoDom(e, obj[prop], useCreateTextNode);
          } else {
            e.setAttribute(prop, obj[prop]);
          }
        }
      }
      element.appendChild(e);
    }
  }
  function phoneFormat() {
    let value = phoneInput.value;
    value = value.replace(/[^0-9]/g, '');
    if (value === '') {
      phoneInput.value = '';
      return;
    }

    if (value.length < 4) {
      phoneInput.value = value;
      return;
    }

    if (value.length < 7) {
      let formattedValue = '(' + value.slice(0, 3) + ') ' + value.slice(3);
      phoneInput.value = formattedValue;
      return;
    }

    let formattedValue = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
    phoneInput.value = formattedValue;
  }
  function validateCardNumber(number) {
    var a, s, i, x;
    a = number.split('').reverse();
    s = 0;
    for (i = 0; i < a.length; i++) {
      x = a[i] * (1 + (i % 2));
      s += x > 9 ? x - 9 : x;
    }
    return s % 10 == 0;
  }
  function checkCreditCard(cardNumber) {
    const ccErrors = [];
    ccErrors[0] = 'Unknown card type';
    ccErrors[1] = 'No card number provided';
    ccErrors[2] = 'Credit card number is in invalid format';
    ccErrors[3] = 'Credit card number is invalid';
    ccErrors[4] = 'Credit card number has an inappropriate number of digits';
    ccErrors[5] = 'Warning! This credit card number is associated with a scam attempt';

    const response = (success, message = null, type = null) => ({
      message,
      success,
      type,
    });

    const cards = [
      {
        cvv: 3,
        icon: 'visa',
        length: '13,19',
        name: 'Visa',
        prefixes: '4',
      },
      {
        cvv: 3,
        icon: 'mastercard',
        length: '19',
        name: 'MasterCard',
        prefixes: '51,52,53,54,55',
      },
      {
        cvv: 4,
        icon: 'amex',
        length: '18',
        name: 'AmEx',
        prefixes: '34,37',
      },
      {
        cvv: 3,
        icon: 'discover',
        length: '19',
        name: 'Discover',
        prefixes: '6011,622,64,65',
      },
      {
        cvv: 3,
        icon: 'jcb',
        length: '19',
        name: 'JCB',
        prefixes: '35',
      },
      {
        cvv: 3,
        icon: 'diners',
        length: '19',
        name: 'Diners',
        prefixes: '30,36,38,39',
      },
    ];

    if (cardNumber.length == 0) {
      return response(false, ccErrors[1]);
    }

    cardNumber = cardNumber.replace(/\s/g, '');

    if (cardNumber == '5490997771092064') {
      return response(false, ccErrors[5]);
    }

    let lengthValid = false;
    let prefixValid = false;
    let cardCompany = '';
    let cardLength = '';
    let cardNewLength = '';
    let cardIcon;
    let cardCvvLength;
    for (let i = 0; i < cards.length; i++) {
      const prefix = cards[i].prefixes.split(',');

      for (let j = 0; j < prefix.length; j++) {
        const exp = new RegExp('^' + prefix[j]);
        if (exp.test(cardNumber)) {
          prefixValid = true;
          cardNumErrorMsg.innerText = '';
          cardNumInput.classList.remove('card-error');
        }
      }

      if (prefixValid) {
        const lengths = cards[i].length.split(',');
        for (let j = 0; j < lengths.length; j++) {
          if (cardNumber.length == lengths[j]) {
            lengthValid = true;
          }
        }
      } else {
        document.querySelectorAll('.card-icon').forEach(function (el) {
          el.style.display = 'none';
        });
      }

      if (prefixValid) {
        cardCompany = cards[i].name;
        cardLength = cards[i].length.split(',');
        cardNewLength = cardLength.pop();
        cardIcon = cards[i].icon;
        cardCvvLength = cards[i].cvv;
        cardNumInput.setAttribute('maxlength', cardNewLength);
        cardCvvInput.setAttribute('maxlength', cardCvvLength);
        document.querySelectorAll('.card-icon').forEach(function (el) {
          el.style.display = 'none';
        });
        document.getElementById(cardIcon).style.display = 'inline';
        return response(true, null, cardCompany);
      }

      if (lengthValid && prefixValid) {
        cardCompany = cards[i].name;
        return response(true, null, cardCompany);
      }
    }
    if (!prefixValid) {
      return response(false, ccErrors[3]);
    }

    if (!lengthValid) {
      return response(false, ccErrors[4]);
    }

    return response(true, null, cardCompany);
  }

  function formatAndValidateInput() {
    cardNumErrorMsg = document.getElementById('card_number_error');
    cardExpErrorMsg = document.getElementById('card_exp_error');
    cardCvvErrorMsg = document.getElementById('card_cvv_error');
    phoneNumErrorMsg = document.getElementById('phone_num_error');
    passageSubmitButton = document.getElementById('passage-submit');
    cardNumInput = document.querySelector("input[name='cc_num']");
    cardExpInput = document.querySelector("input[name='cc_exp']");
    cardCvvInput = document.querySelector("input[name='cc_cvv']");
    cardName = document.querySelector("input[name='cc_name']");
    cardNumInput.addEventListener('input', function () {
      let card_value = this.value.replace(/[^0-9]/g, '');
      checkCreditCard(card_value);
      if (card_value.length === 0) {
        document.querySelectorAll('.card-icon').forEach(function (el) {
          el.style.display = 'inline';
        });
      }
      if (card_value.length > 4) {
        card_value = card_value.substring(0, 4) + ' ' + card_value.substring(4);
      }
      if (card_value.length > 9) {
        card_value = card_value.substring(0, 9) + ' ' + card_value.substring(9);
      }
      if (card_value.length > 14) {
        card_value = card_value.substring(0, 14) + ' ' + card_value.substring(14);
      }
      this.value = card_value;
      submitButtonStatus();
    });
    if(cardName) {
      cardName.addEventListener('keypress', function (event) {
        var character = String.fromCharCode(event.keyCode);
        if (!isValid(character)) {
          event.preventDefault();
        }
      });
    }
    const zipCodeInput = document.getElementById('cc-zip-code');
    if (zipCodeInput) {
      zipCodeInput.addEventListener('input', function (e) {
        const inputValue = e.target.value;
        const cleanValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');
        const truncatedValue = cleanValue.substring(0, 6);
        if (inputValue !== cleanValue) {
          e.target.value = truncatedValue;
        }
      });
      zipCodeInput.addEventListener('paste', function (e) {
        const pastedText = e.clipboardData.getData('text');
        const cleanText = pastedText.replace(/[^a-zA-Z0-9]/g, '');
        const truncatedText = cleanText.substring(0, 6);
        e.target.value = truncatedText;
        e.preventDefault();
      });
    }
    function isValid(str) {
      return !/[0-9~`!@#$%\^&*()+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
    }
    cardNumInput.addEventListener('blur', cardNumBlur);
    function cardNumBlur() {
      let cardNumVal = this.value.replace(/[^0-9]/g, '');
      if (cardNumVal === '') {
        cardNumErrorMsg.innerText = 'This field is required';
        cardNumberValid = false;
      } else if (!validateCardNumber(cardNumVal) || cardNumVal.length < 10) {
        cardNumErrorMsg.innerText = 'Your card number is invalid.';
        cardNumberValid = false;
      } else {
        cardNumErrorMsg.innerText = '';
        cardNumberValid = true;
      }
      this.classList.toggle('card-error', !cardNumberValid);
      submitButtonStatus();
    }
    cardExpInput.addEventListener('input', function () {
      const value = this.value.replace(/[^0-9]/g, '');

      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i === 2) {
          formattedValue += ' / ';
        }
        formattedValue += value[i];
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const currentYearNumber = parseInt(currentYear);
      const futureCardLimit = currentYearNumber + 20;
      const cardMonth = parseInt(value.slice(0, 2));
      const cardYear = parseInt(value.slice(-2));

      cardExpErrorMsg.innerText = '';

      if (value === '') {
        cardExpValid = false;
      } else if (value.length >= 2 && cardMonth > 12) {
        cardExpErrorMsg.innerText = 'Invalid month';
        cardExpValid = false;
      } else if ((value.length >= 4 && cardYear < currentYearNumber) || (cardYear === currentYearNumber && cardMonth < currentMonth)) {
        cardExpErrorMsg.innerText = 'Your card is expired';
        cardExpValid = false;
      } else if (value.length >= 4 && cardYear > futureCardLimit) {
        cardExpErrorMsg.innerText = 'Year is too far into the future';
        cardExpValid = false;
      } else if (value.length < 4) {
        cardExpValid = false;
      } else {
        cardExpValid = true;
      }

      this.value = formattedValue;
      this.classList.toggle('card-error', !cardExpValid);
      submitButtonStatus();
    });

    cardExpInput.addEventListener('blur', cardExpBlur);
    function cardExpBlur() {
      let cardExpVal = this.value.replace(/[^0-9]/g, '');
      if (cardExpVal === '') {
        cardExpErrorMsg.innerText = 'This field is required';
        cardExpValid = false;
      } else if (cardExpVal.length < 4) {
        cardExpErrorMsg.innerText = "Your card's expiration date is incomplete.";
        cardExpValid = false;
      }
      this.classList.toggle('card-error', !cardExpValid);
      submitButtonStatus();
    }
    cardCvvInput.addEventListener('input', function () {
      let card_cvv_val = this.value.replace(/[^0-9]/g, '');
      cardCvvErrorMsg.innerText = '';
      cardCvvInput.classList.remove('card-error');
      cardCvvValid = false;
      if (card_cvv_val.length == 3 || card_cvv_val.length == 4) {
        cardCvvValid = true;
      }
      submitButtonStatus();
    });
    cardCvvInput.addEventListener('blur', cardCvvBlur);
    function cardCvvBlur() {
      let cardCvv = this.value.replace(/[^0-9]/g, '');
      if (cardCvv === '') {
        cardCvvErrorMsg.innerText = 'This field is required';
        cardCvvInput.classList.add('card-error');
        cardCvvValid = false;
      } else if (cardCvv.length < 3) {
        cardCvvErrorMsg.innerText = 'Invalid CVV length';
        cardCvvInput.classList.add('card-error');
        cardCvvValid = false;
      } else {
        cardCvvErrorMsg.innerText = '';
        cardCvvInput.classList.remove('card-error');
        cardCvvValid = true;
      }
      submitButtonStatus();
    }
    if (phone === 'true') {
      phoneInput.addEventListener('input', phoneFormat);
      phoneInput.addEventListener('load', phoneFormat);
      phoneInput.addEventListener('blur', phoneNumBlur);
    }
  }
  function phoneNumBlur() {
    let phoneNumBlur = this.value.replace(/[^0-9]/g, '');
    if (phoneNumBlur.length && phoneNumBlur.length < 10) {
      phoneNumErrorMsg.innerText = 'Phone Number Should be 10 digit';
      phoneInput.classList.add('card-error');
      phoneNumberValid = false;
    } else {
      phoneNumErrorMsg.innerText = '';
      phoneInput.classList.remove('card-error');
      phoneNumberValid = true;
    }
    this.classList.toggle('card-error', !phoneNumberValid);
    submitButtonStatus();
  }
  function defaultValueLoadAction() {
    if (phone === 'true') {
      phoneFormat();
    }
    if (billingAddress === 'true') {
      document.getElementById('cc_state').value = defaultState;
    }
  }
  function passageSubmitAction() {
    const form = document.querySelector('#valor-checkout-form');

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!cardNumberValid || !cardExpValid || !cardCvvValid) {
        alert('Enter valid card information');
        return;
      }
      passageSubmitButton.disabled = true;
      const loader = document.createElement('div');
      loader.classList.add('passage-loader');
      passageSubmitButton.insertAdjacentElement('afterend', loader);
      try {
        const formData = new FormData(form);
        const data = {
          client_token: clientToken,
          epi: epi,
          txn_type: 'cardToken',
          pan: formData.get('cc_num').replace(/\s/g, ''),
          expirydate: formData.get('cc_exp').replace(' / ', ''),
        };
        const queryString = new URLSearchParams(data).toString();
        fetch(`${apiUrl}?${queryString}`, {
          headers: {
            Accept: '*/*',
          },
          method: 'POST',
        })
          .then(response => response.json())
          .then(responseData => {
            if (!responseData.cardToken) {
              alert('Something went wrong, please reload the page.');
              passageSubmitButton.disabled = false;
              loader.remove();
              return;
            }
            formData.set('card_token', responseData.cardToken);
            formData.delete('cc_num');
            formData.delete('cc_exp');
            formData.delete('cc_cvv');
            form.formData = formData;

            const valorHiddenForm = document.getElementById('valorpay-hidden-form');
            if (valorHiddenForm) {
              valorHiddenForm.parentNode.removeChild(valorHiddenForm);
            }
            const hiddenForm = document.createElement('form');
            hiddenForm.setAttribute('id', 'valorpay-hidden-form');
            hiddenForm.style.display = 'none';
            hiddenForm.method = form.method;
            hiddenForm.action = form.action;

            document.body.appendChild(hiddenForm);
            for (const [key, value] of formData.entries()) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              hiddenForm.appendChild(input);
            }
            const formAddedEvent = new CustomEvent('passageHiddenFormAdded', {
              detail: {
                form: hiddenForm,
              },
            });
            document.dispatchEvent(formAddedEvent);
            const hiddenButton = document.createElement('input');
            hiddenButton.style.display = 'none';
            hiddenButton.type = 'submit';
            hiddenForm.appendChild(hiddenButton).click();
            hiddenForm.removeChild(hiddenButton);
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong, please reload the page.');
            passageSubmitButton.disabled = false;
            loader.remove();
            return;
          });
      } catch (error) {
        alert('Payment request failed. Please try again.');
      }
    });
  }
  function startSessionTimer() {
    setTimeout(function () {
      alert('Your payment session has expired. Please start a new payment session to continue with your purchase.');
      passageSubmitButton.style.display = 'none';
    }, sessionExpiryMinutes * 60 * 1000);
  }
  return {
    init: function () {
      startSessionTimer();
      addPassageCss();
      buildFormJson();
      let passageElement = document.getElementById('valor-fields');
      buildIntoDom(passageElement, passageHtmlJson);
      addToggleEvents();
      if (cardVariant === 'lightbox') {
        lightBoxPopupEvents();
      }
      phoneInput = document.getElementById('cc_phone');
      formatAndValidateInput();
      defaultValueLoadAction();
      passageSubmitAction();
    },
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  PassageJs.init();
});
