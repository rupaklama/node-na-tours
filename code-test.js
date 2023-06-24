var botSession = require(__base + '/core/storage/vzbotlpclient').vzbotlpclient;
var moment = require('moment');
class TemplateBuilder {
  planBuilderTmpl(param) {
    if (param.statusCode == '200') {
      const template = param.template;
      let planTemplate = require('./schema/card/planCardMolecule.json');
      const linemolecule = require('./schema/card/line.json');
      const changePlanCTA = {
        moleculeName: 'botItem',
        molecule: {
          spacing: 15,
          action: {
            actionType: 'openURL',
            browserUrl: 'https://www.verizon.com/inhome/change/buildproducts',
            newTab: true,
          },
          title: 'Change my plan',
          moleculeName: 'caretLink',
        },
      };
      const btnTemplate = [
        {
          action: {
            displayMolecule: {
              moleculeName: 'label',
              text: 'My Internet plan',
            },
            actionType: 'botSearch',
            extraParameters: {
              searchTerm: 'My Internet plan',
            },
            pageType: 'search',
            appContext: 'mobileFirstSS',
          },
          moleculeName: 'caretLink',
          title: 'My Internet plan',
        },
        {
          title: 'My TV plan',
          moleculeName: 'caretLink',
          action: {
            displayMolecule: {
              text: 'My TV plan',
              moleculeName: 'label',
            },
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            pageType: 'search',
            extraParameters: {
              searchTerm: 'My TV plan',
            },
          },
        },
        {
          moleculeName: 'caretLink',
          title: 'My Phone plan',
          action: {
            pageType: 'search',
            appContext: 'mobileFirstSS',
            extraParameters: {
              searchTerm: 'My Phone plan',
            },
            actionType: 'botSearch',
            displayMolecule: {
              moleculeName: 'label',
              text: 'My Phone plan',
            },
          },
        },
      ];
      planTemplate.botItems[1].molecule.card.molecules = [];
      planTemplate.botItems[2].molecule.caretLinks = [];
      planTemplate.botItems[1].molecule.card.molecules.push({
        moleculeName: 'stackItem',
        spacing: 8,
        molecule: {
          moleculeName: 'label',
          text: 'Your current plan',
        },
      });
      let planType = {
        moleculeName: 'stackItem',
        spacing: 10,
        molecule: {
          moleculeName: 'label',
          text: template.planType,
          fontStyle: 'H2',
        },
      };
      planTemplate.botItems[1].molecule.card.molecules.push(planType);
      let monthylCharges = {
        moleculeName: 'stackItem',
        spacing: 10,
        molecule: {
          moleculeName: 'label',
          text: template.monthylCharges,
        },
      };
      template.monthylCharges &&
        planTemplate.botItems[1].molecule.card.molecules.push(monthylCharges);
      template.plans &&
        planTemplate.botItems[1].molecule.card.molecules.push(linemolecule);
      template.plans.forEach((val) => {
        planTemplate.botItems[1].molecule.card.molecules.push({
          moleculeName: 'stackItem',
          spacing: 20,
          molecule: {
            moleculeName: 'label',
            text: val.title,
            fontStyle: 'H3',
          },
        });
        planTemplate.botItems[1].molecule.card.molecules.push({
          moleculeName: 'stackItem',
          spacing: 10,
          molecule: {
            moleculeName: 'leftRightLabelView',
            leftText: {
              moleculeName: 'label',
              text: val.description || '',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
            },
            rightText: {
              moleculeName: 'label',
              text: val.amount || '',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
            },
          },
        });
      });
      let changeArr = btnTemplate;
      let planArr = template.plans;
      let filterButtons = changeArr.filter((btnEle) =>
        planArr.some((serverEle) => btnEle.title.includes(serverEle.title))
      );
      planTemplate.botItems[2].molecule.caretLinks = filterButtons;
      planTemplate.botItems[2].molecule.caretLinks.splice(0, 0, changePlanCTA);
      // planTemplate.botItems[4].molecule.buttons = filterButtons;
      return planTemplate;
    } else {
      // let res = require('./schema/dfb.json');
      let res = require('./schema/card/errorViewPlanCard.json');
      return res;
    }
  }

  dateFormatter(DueDate) {
    if (DueDate && DueDate.split('/').length === 3) {
      const nth = function (d) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      };
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      DueDate = new Date(
        DueDate.split('/')[2],
        parseInt(DueDate.split('/')[0]) - 1,
        DueDate.split('/')[1]
      );
      DueDate = `${monthNames[DueDate.getMonth()]} ${DueDate.getDate()}${nth(
        DueDate.getDate()
      )}, ${DueDate.getFullYear()}`;
    }
    return DueDate;
  }

  //STB Carousel Builder
  stbCarouselBuilder(param, statusCode) {
    if (statusCode == '200') {
      const orderData = param.OrderInfoList;
      let stbTemplate = JSON.parse(
        JSON.stringify(
          require('./schema/card/stbActivation/stbMultipleOrder.json')
        )
      );
      const linemolecule = require('./schema/card/line.json');

      orderData.forEach((val) => {
        if (val.OrderStatus && val.OrderStatus.toLowerCase() == 'pending') {
          let carouselItem = JSON.parse(
            JSON.stringify(
              require('./schema/card/stbActivation/stbSliderItem.json')
            )
          );
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            spacing: 8,
            molecule: {
              moleculeName: 'label',
              text: `Order Number : ${val.OrderNumber ? val.OrderNumber : ''}`,
            },
          });
          let formattedDate = val.OrderCreateDate;
          if (formattedDate) formattedDate = this.dateFormatter(formattedDate);
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            spacing: 8,
            molecule: {
              moleculeName: 'label',
              text: `Created Date : ${formattedDate ? formattedDate : ''}`,
            },
          });
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            spacing: 8,
            molecule: {
              moleculeName: 'label',
              text: `Service Address :`,
            },
          });
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            spacing: 0,
            molecule: {
              moleculeName: 'label',
              noMargin: true,
              text: `${
                val.ServiceAddress
                  ? val.ServiceAddress.replace(/,/g, ',\n')
                  : ''
              }`,
            },
          });

          carouselItem.molecule.molecules.push(linemolecule);
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            spacing: 8,
            molecule: {
              style: 'secondary',
              action: {
                actionType: 'botSearch',
                appContext: 'mobileFirstSS',
                displayMolecule: {
                  text: 'Activate ' + val.OrderNumber,
                  moleculeName: 'label',
                },
                pageType: 'search',
                extraParameters: {
                  searchTerm: 'STBActivateOrderNumber_' + val.OrderNumber,
                },
              },
              moleculeName: 'buttonCustom',
              title: 'Activate',
            },
          });
          carouselItem.molecule.molecules.push({
            moleculeName: 'stackItem',
            molecule: {
              style: 'secondary',
              action: {
                actionType: 'botSearch',
                appContext: 'mobileFirstSS',
                displayMolecule: {
                  text: 'Different Set Top Box',
                  moleculeName: 'label',
                },
                pageType: 'search',
                extraParameters: {
                  searchTerm: 'Different Set Top Box',
                },
              },
              moleculeName: 'buttonCustom',
              title: 'Different Set Top Box',
            },
          });

          stbTemplate.botItems[1].molecule.molecules.push(carouselItem);
        }
      });

      return stbTemplate;
    } else {
      let res = require('./schema/dfb.json');
      return res;
    }
  }
  //STB Carousel Builder

  //STB Activate
  stbActivate(payload) {
    let basePayload = {
      behaviors: [
        {
          enable: true,
          type: 'enableTextField',
        },
        {
          enable: true,
          type: 'voiceControl',
        },
      ],
      botItems: [],
      header: {
        moleculeName: 'botHeader',
        image: {
          moleculeName: 'image',
          image: 'mf_agent',
        },
      },
    };
    let orderNum = payload && payload.split('#STBNumber#_')[1];
    if (orderNum) {
      basePayload.botItems.push(
        {
          molecule: {
            moleculeName: 'label',
            text: `Got it! <b>Order Number : </b>${orderNum}\n Can you confirm that the power and aux cable are securely connected to the Set Top Box?`,
          },
          moleculeName: 'botItem',
        },
        {
          moleculeName: 'botItem',
          molecule: {
            style: 'secondary',
            action: {
              actionType: 'botSearch',
              appContext: 'mobileFirstSS',
              displayMolecule: {
                text: 'Yes, all connections are plugged in',
                moleculeName: 'label',
              },
              pageType: 'search',
              extraParameters: {
                searchTerm: 'Yes, all connections are plugged in',
              },
            },
            moleculeName: 'buttonCustom',
            title: 'Yes, all connections are plugged in',
          },
        }
      );
    }
    return basePayload;
  }
  //STB Activate

  //Appointment TroubleType Builder
  troubleTypeBuilder(param, statusCode) {
    if (statusCode == '200') {
      let troubleTypeTemplate = JSON.parse(
        JSON.stringify(
          require('./schema/card/appointment/troubleTypeDropdown.json')
        )
      );
      let optionChanges = [];
      optionChanges = param.map((item) => {
        return {
          value: item.reasonCode,
          key: item.troubleType,
        };
      });
      troubleTypeTemplate.botItems[1].molecule.ddOptions = optionChanges;
      return troubleTypeTemplate;
    } else {
      let res = require('./schema/dfb.json');
      return res;
    }
  }
  //Appointment TroubleType Builder

  //New Appointment Builder
  newAppointmentBuilder(param, statusCode) {
    if (statusCode == '200') {
      try {
        let newAppointmentTemplate = JSON.parse(
          JSON.stringify(
            require('./schema/card/appointment/newAppointment.json')
          )
        );

        //For Date molecule
        if (param.minDate != '' && param.maxDate != '') {
          newAppointmentTemplate.botItems[0].molecule.dateType.minDate =
            param.minDate;
          newAppointmentTemplate.botItems[0].molecule.dateType.maxDate =
            param.maxDate;
          newAppointmentTemplate.botItems[0].molecule.dateType.date =
            param.minDate;
        } else {
          throw ' while creating date molecule';
        }

        //For slot molecule
        if (param.scheduledSlots != '') {
          newAppointmentTemplate.botItems[0].molecule.timeTemplate.scheduledSlots =
            param.scheduledSlots;
        } else {
          throw ' while creating slots molecule';
        }

        return newAppointmentTemplate;
      } catch (e) {
        logger.error(
          'An error occured creating New appointment template' +
            e.toString() +
            JSON.stringify(param)
        );
        let res = require('./schema/dfb.json');
        return res;
      }
    } else {
      let res = require('./schema/dfb.json');
      return res;
    }
  }
  //New Appointment Builder

  //Modify Appointment Builder
  modifyAppointmentBuilder(param, statusCode) {
    if (statusCode == '200') {
      try {
        let modifyAppointmentTemplate = JSON.parse(
          JSON.stringify(
            require('./schema/card/appointment/modifyAppointment.json')
          )
        );

        //For Date molecule
        if (
          param.minDate != '' &&
          param.maxDate != '' &&
          param.selectedDate != ''
        ) {
          modifyAppointmentTemplate.botItems[1].molecule.dateType.minDate =
            param.minDate;
          modifyAppointmentTemplate.botItems[1].molecule.dateType.maxDate =
            param.maxDate;
          modifyAppointmentTemplate.botItems[1].molecule.dateType.date =
            param.selectedDate;
        } else {
          throw ' while creating date molecule';
        }

        //For slot molecule
        if (
          param.selectedSlot != '' &&
          param.scheduledSlots != '' &&
          param.selectedDate != ''
        ) {
          // let changedTime = Object.keys(param.scheduledSlots).filter((key) => moment(key, "MM/DD/YYYY").format("L").includes(moment(param.selectedDate, "MM/DD/YYYY").format("L"))).map(key => {
          //  return param.scheduledSlots[key]
          // })[0];
          // if (changedTime == undefined || changedTime == null || (Array.isArray(changedTime) && changedTime.length == 0)) {
          //  throw ' Selected slot is not present in scheduledSlots, Cant create template';
          // } else {
          //  modifyAppointmentTemplate.botItems[1].molecule.timeTemplate.selectedSlot = param.selectedSlot;
          //  modifyAppointmentTemplate.botItems[1].molecule.timeTemplate.scheduledSlots = param.scheduledSlots;
          // }
          modifyAppointmentTemplate.botItems[1].molecule.timeTemplate.scheduledSlots =
            param.scheduledSlots;
        } else {
          throw ' while creating slots molecule';
        }

        return modifyAppointmentTemplate;
      } catch (e) {
        logger.error(
          'An error occured creating modify appointment template' +
            e.toString() +
            JSON.stringify(param)
        );
        let res = require('./schema/dfb.json');
        return res;
      }
    } else {
      let res = require('./schema/dfb.json');
      return res;
      a;
    }
  }
  //Modify Appointment Builder

  billBuilderTmpl(param) {
    let billTempl = Object.assign(
      {},
      require('./schema/card/billCardMolecule.json')
    );
    const linemolecule = Object.assign({}, require('./schema/card/line.json'));
    const lRmolecule = Object.assign(
      {},
      require('./schema/card/stackLRLabel.json')
    );
    const stackLabel = Object.assign(
      {},
      require('./schema/card/stackLabel.json')
    );
    if (param.statusCode == '200') {
      const billTemplate = { ...billTempl };
      billTemplate.botItems[1].molecule.card.molecules[0].molecule.text =
        param.template.param1;
      billTemplate.botItems[1].molecule.card.molecules[1].molecule.text =
        param.template.param2;
      billTemplate.botItems[1].molecule.card.molecules[2].molecule.text =
        param.template.param3;

      //followup scenario based here
      if (param.template.templateType) {
        if (param.template.templateType === 'E') {
          billTemplate.botItems[1].molecule.card.molecules.push(linemolecule);
          let a = [
            { name: 'Total balance', value: param.template.param4 },
            { name: 'Past due balance', val: param.template.param5 },
          ];
          a.forEach((val, e) => {
            lRmolecule.molecule.leftText.text = val.name;
            lRmolecule.molecule.rightText.text = val.value;
            billTemplate.botItems[1].molecule.card.molecules.push(lRmolecule);
          });
        } else if (param.template.templateType === 'G') {
          billTemplate.botItems[1].molecule.card.molecules.push(linemolecule);
          stackLabel.molecule.text = param.template.param4;
          billTemplate.botItems[1].molecule.card.molecules.push(stackLabel);
        }
        let fb = require('./schema/card/billFollowup/' +
          param.template.templateType +
          '.json');
        billTemplate.botItems[4] = fb;
      }
      return billTemplate;
    } else {
      let res = require('./schema/card/Fallback.json');
      return res;
    }
  }

  billBuilderTmplv1(param, convArr) {
    let billTempl = JSON.parse(
      JSON.stringify(require('./schema/card/billCardMolecule.json'))
    );
    const linemolecule = Object.assign({}, require('./schema/card/line.json'));
    const stackLabel = Object.assign(
      {},
      require('./schema/card/stackLabel.json')
    );

    if (param.statusCode == '200') {
      try {
        let val = {
          totalBalance: param.template.totalBalance,

          pastDueAmount: param.template.pastDueAmount,
        };
        let inpparams = {
          convId: convArr.convId || convArr.conversationId,
          uKey: 'BillBalance',
        };
        botSession.deleteByKeyId(inpparams, function (err, res) {
          inpparams.uVal = val;
          botSession.createSesnByIdKey(inpparams, function (err, msg) {
            logger.debug('Amount due and past due balance details saved to DB');
          });
        });
      } catch (e) {
        logger.error(
          'An error occured while saving amt due and past due balance to DB' +
            e.toString()
        );
      }
      const billTemplate = { ...billTempl };
      //Fix for CXTDT-173387
      if (param.template.param1) {
        billTemplate.botItems[1].molecule.card.molecules.push({
          moleculeName: 'stackItem',
          spacing: 8,
          molecule: {
            moleculeName: 'label',
            text: param.template.param1,
          },
        });
      }
      if (param.template.param2) {
        billTemplate.botItems[1].molecule.card.molecules.push({
          moleculeName: 'stackItem',
          spacing: 10,
          molecule: {
            moleculeName: 'label',
            text: param.template.param2,
            fontStyle: 'H2',
          },
        });
      }
      if (param.template.param3) {
        billTemplate.botItems[1].molecule.card.molecules.push({
          moleculeName: 'stackItem',
          spacing: 10,
          molecule: {
            moleculeName: 'label',
            text: param.template.param3,
          },
        });
      }

      //followup scenario based here
      if (param.template.templateType) {
        if (param.template.templateType === 'E') {
          // const lRmolecule = Object.assign({},require('./schema/card/stackLRLabel.json'));
          billTemplate.botItems[1].molecule.card.molecules.push(linemolecule);
          let a = [
            { name: 'Total balance', text: param.template.param4 },
            { name: 'Past due balance', text: param.template.param5 },
          ];
          a.map((val) => {
            const lRmolecule = JSON.parse(
              JSON.stringify(require('./schema/card/stackLRLabel.json'))
            );
            lRmolecule.molecule.leftText.text = val.name;
            lRmolecule.molecule.rightText.text = val.text;
            billTemplate.botItems[1].molecule.card.molecules.push(lRmolecule);
          });
        } else if (param.template.templateType === 'G') {
          billTemplate.botItems[1].molecule.card.molecules.push(linemolecule);
          stackLabel.molecule.text = param.template.param4;
          billTemplate.botItems[1].molecule.card.molecules.push(stackLabel);
        }

        let fb = require('./schema/card/billFollowup/' +
          param.template.templateType +
          '.json');

        // const scheduledPaymentMsg = `It looks like you have a scheduled payment
        // for ${param.template.scheduleDate} for $${param.template.scheduleDueAmount}. If you pay now,
        // you may wish to cancel your scheduled payment.`;

        if (
          param.template.templateType == 'E' &&
          param.template.scheduleDueAmount &&
          param.template.scheduleDate
        ) {
          billTemplate.botItems[3].molecule.text = `It looks like you have a scheduled payment 
          for ${param.template.scheduleDate} for $${param.template.scheduleDueAmount}. If you pay now, 
          you may wish to cancel your scheduled payment.`;
          billTemplate.botItems[4] = fb.buttons[0];
        }
        // else if (param.template.templateType == "D" && param.template.scheduleDueAmount && param.template.scheduleDate) {
        //   billTemplate.botItems[3].molecule.text = scheduledPaymentMsg;
        //   billTemplate.botItems[4] = fb.buttons[0];
        // }
        else if (
          param.template.templateType == 'E' ||
          param.template.templateType == 'C' ||
          param.template.templateType == 'D'
        ) {
          billTemplate.botItems[3].molecule.text =
            "Would you like to pay now? Select an option to continue. You'll be able to choose your payment method after your selection.";
          billTemplate.botItems[4] = fb.buttons[1];
        } else {
          billTemplate.botItems[3].molecule.text =
            'Is there anything else I can help with?';
        }
      }
      return billTemplate;
    } else {
      let res = require('./schema/card/Fallback.json');
      return res;
    }
  }

  viewBillBaseTemplate(param) {
    let viewBillTempl = Object.assign(
      {},
      require('./schema/card/viewBill/viewBillBase.json')
    );

    try {
      if (
        param.template.status == '200' &&
        param.template.isBillPresent == 'true'
      ) {
        const viewbillTemplate = JSON.parse(JSON.stringify(viewBillTempl));

        viewbillTemplate.botItems[1].molecule.text = `Here is an overview of your ${param.template.billMonth} bill.`;
        viewbillTemplate.botItems[2].molecule.card.molecules = [];

        let a = [
          { name: 'Amount :', value: param.template.billAmount },
          { name: 'Bill cycle:', value: param.template.billCycle },
          { name: 'Due Date :', value: param.template.dueDate },
        ];
        a.forEach((val) => {
          const lRmolecule = JSON.parse(
            JSON.stringify(require('./schema/card/stackLRLabel.json'))
          );
          lRmolecule.molecule.leftText.text = val.name;
          lRmolecule.molecule.rightText.text = val.value;
          lRmolecule.molecule.leftText.fontStyle = 'H3';
          viewbillTemplate.botItems[2].molecule.card.molecules.push(lRmolecule);
        });

        param.template.serviceList.forEach((val) => {
          const stackBillTitle = {
            moleculeName: 'stackItem',
            spacing: 10,
            molecule: {
              moleculeName: 'label',
              text: '',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
              fontStyle: 'H3',
              attributes: [
                {
                  type: 'font',
                  location: 0,
                  length: 0,
                  size: 13,
                  name: 'NHaasGroteskDSStd-55Rg',
                },
              ],
            },
          };
          const stackBillAmount = {
            moleculeName: 'stackItem',
            spacing: 0,
            molecule: {
              moleculeName: 'label',
              noMargin: true,
              text: '',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
            },
          };
          stackBillTitle.molecule.text = val.title;
          stackBillAmount.molecule.text = `$ ${val.amount}`;
          viewbillTemplate.botItems[2].molecule.card.molecules.push(
            stackBillTitle
          );
          viewbillTemplate.botItems[2].molecule.card.molecules.push(
            stackBillAmount
          );
        });

        if (
          param.template.autopayStatus &&
          param.template.autopayStatus == 'N'
        ) {
          let CTAForAutoPay = {
            style: 'secondary',
            action: {
              actionType: 'botSearch',
              appContext: 'mobileFirstSS',
              displayMolecule: {
                text: 'Set up Auto Pay',
                moleculeName: 'label',
              },
              pageType: 'search',
              extraParameters: {
                searchTerm: 'Autopay',
              },
            },
            moleculeName: 'buttonCustom',
            title: 'Set up Auto Pay',
          };
          viewbillTemplate.botItems.push(CTAForAutoPay);
        }

        return viewbillTemplate;
      } else {
        logger.error(
          'An error occured creating view bill initial template' +
            JSON.stringify(param)
        );
        let res = require('./schema/dfb.json');
        return res;
      }
    } catch (e) {
      logger.error(
        'An error occured creating view bill initial template tryCatch' +
          e.toString() +
          JSON.stringify(param)
      );
      let res = require('./schema/dfb.json');
      return res;
    }
  }

  viewBillCTATemplate(param) {
    let viewBillCTATempl = Object.assign(
      {},
      require('./schema/card/viewBill/viewBillCTA.json')
    );

    try {
      if (param.respFlags.status == '200') {
        const ctaTemplate = { ...viewBillCTATempl };

        ctaTemplate.botItems[0].molecule.caretLinks = [];

        param.template.serviceList.forEach((val) => {
          const dynamicLink = {
            moleculeName: 'caretLink',
            action: {
              appContext: 'mobileFirstSS',
              displayMolecule: {
                moleculeName: 'label',
                text: '',
              },
              actionType: 'botSearch',
              pageType: 'search',
              extraParameters: {
                searchTerm: '',
              },
            },
            title: '',
          };

          dynamicLink.title = val.title;
          dynamicLink.action.displayMolecule.text = val.title;
          dynamicLink.action.extraParameters.searchTerm = val.searchTerm;

          ctaTemplate.botItems[0].molecule.caretLinks.push(dynamicLink);
        });

        return ctaTemplate;
      } else {
        logger.error(
          'An error occured creating view bill dynamic CTA template' +
            JSON.stringify(param)
        );
        let res = require('./schema/dfb.json');
        return res;
      }
    } catch (e) {
      logger.error(
        'An error occured creating view bill dynamic CTA template tryCatch' +
          e.toString() +
          JSON.stringify(param)
      );
      let res = require('./schema/dfb.json');
      return res;
    }
  }

  viewBillBreakdownTemplate(param) {
    let viewBillBreakdownTempl = Object.assign(
      {},
      require('./schema/card/viewBill/viewBillBreakDown.json')
    );

    try {
      if (param.template.status == '200') {
        const breakdownTemplate = { ...viewBillBreakdownTempl };

        breakdownTemplate.botItems[0].molecule.text = `Here are a breakdown of your ${param.template.serviceTitle} charges.`;
        breakdownTemplate.botItems[1].molecule.card.molecules = [];
        breakdownTemplate.botItems[2].molecule.caretLinks = [];

        param.template.breakdownList.forEach((val) => {
          const breakdownTitle = {
            moleculeName: 'stackItem',
            spacing: 10,
            molecule: {
              moleculeName: 'label',
              text: '',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
              fontStyle: 'H3',
              attributes: [
                {
                  type: 'font',
                  location: 0,
                  length: val.title.length,
                  size: 14,
                  name: 'NHaasGroteskDSStd-55Rg',
                },
              ],
            },
          };
          breakdownTitle.molecule.text = `${val.title} : $${val.amount}`;
          // breakdownAmount.molecule.text = val.amount;
          breakdownTemplate.botItems[1].molecule.card.molecules.push(
            breakdownTitle
          );
          // breakdownTemplate.botItems[1].molecule.card.molecules.push(breakdownAmount);

          val.subBody &&
            val.subBody.forEach((val1) => {
              const breakdownAmount = {
                moleculeName: 'stackItem',
                spacing: 0,
                molecule: {
                  moleculeName: 'label',
                  noMargin: true,
                  text: '',
                  textColor: '#505050',
                  backgroundColor: '#FFFFFF',
                  attributes: [
                    {
                      type: 'font',
                      size: 13,
                      name: 'NHaasGroteskDSStd-55Rg',
                    },
                  ],
                },
              };
              breakdownAmount.molecule.text = `${val1.rowTitle} : $${val1.amount}`;
              breakdownTemplate.botItems[1].molecule.card.molecules.push(
                breakdownAmount
              );
            });
        });

        param.template.serviceList.forEach((val) => {
          const dynamicLink = {
            moleculeName: 'caretLink',
            action: {
              appContext: 'mobileFirstSS',
              displayMolecule: {
                moleculeName: 'label',
                text: '',
              },
              actionType: 'botSearch',
              pageType: 'search',
              extraParameters: {
                searchTerm: '',
              },
            },
            title: '',
          };
          dynamicLink.title = val.title;
          dynamicLink.action.displayMolecule.text = val.title;
          dynamicLink.action.extraParameters.searchTerm = val.searchTerm;

          breakdownTemplate.botItems[2].molecule.caretLinks.push(dynamicLink);
        });
        const addLink1 = {
          moleculeName: 'caretLink',
          action: {
            appContext: 'mobileFirstSS',
            displayMolecule: {
              moleculeName: 'label',
              text: 'Bill compare',
            },
            actionType: 'botSearch',
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Bill high',
            },
          },
          title: 'Bill compare',
        };
        const addLink2 = {
          moleculeName: 'caretLink',
          action: {
            appContext: 'mobileFirstSS',
            displayMolecule: {
              moleculeName: 'label',
              text: 'Make a payment',
            },
            actionType: 'botSearch',
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Make a payment',
            },
          },
          title: 'Make a payment',
        };

        breakdownTemplate.botItems[2].molecule.caretLinks.push(addLink1);
        breakdownTemplate.botItems[2].molecule.caretLinks.push(addLink2);

        return breakdownTemplate;
      } else {
        logger.error(
          'An error occured creating view bill breakdown template' +
            JSON.stringify(param)
        );
        let res = require('./schema/dfb.json');
        return res;
      }
    } catch (e) {
      logger.error(
        'An error occured creating view bill breakdown template tryCatch' +
          e.toString() +
          JSON.stringify(param)
      );
      let res = require('./schema/dfb.json');
      return res;
    }
  }

  //Molecule building for credit or debit card
  newCardTemplate() {
    let newCardTempl = Object.assign(
      {},
      require('./schema/card/newCardandAccount/newCardMolecule.json')
    );

    try {
      const cardTemplate = { ...newCardTempl };

      // calculate dynamic months number
      cardTemplate.botItems[0].molecule.cardExp.expMonthTemplate.ddOptions = [];
      const monthArr = Array.from({ length: 12 }, (_, i) => i).map((month) => {
        let monthNum = month + 1;
        return { key: monthNum, value: monthNum };
      });
      cardTemplate.botItems[0].molecule.cardExp.expMonthTemplate.ddOptions =
        monthArr;

      // calculate dynamic year for next 10 years
      cardTemplate.botItems[0].molecule.cardExp.expYearTemplate.ddOptions = [];
      const yearArr = Array.from(
        { length: 10 },
        (_, i) => moment().year() + i
      ).map((year) => {
        return { key: year, value: year };
      });
      cardTemplate.botItems[0].molecule.cardExp.expYearTemplate.ddOptions =
        yearArr;

      return cardTemplate;
    } catch (e) {
      logger.error(
        'An error occured while build adding card molecule tryCatch' +
          e.toString() +
          JSON.stringify(param)
      );
      let res = require('./schema/dfb.json');
      return res;
    }
  }

  textTemplateBuilder(txt) {
    let obj = {
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.AEM',
          content: {
            aemTemplate: {
              header: {
                image: {
                  image: 'mf_agent',
                  moleculeName: 'image',
                },
                moleculeName: 'botHeader',
              },
              botItems: [
                {
                  moleculeName: 'botItem',
                  molecule: {
                    text: txt,
                    moleculeName: 'label',
                  },
                },
              ],
            },
          },
          showAvatar: true,
        },
      ],
    };
    return obj;
  }

  subAccountMessage() {
    const msg = `Sorry, it looks like you are signed in as a sub account user. This selection can only be accessed by a primary account user.`;
    const resp = this.textTemplateBuilder(msg);
    return resp;
  }

  smartFixTmplBuilder(res) {
    //ToDO: add fallback scenarion when statuscode not 200
    const {
      statusDesc,
      apipollingflag,
      transactionID,
      troubleCode,
      statusCode,
      timeout,
    } = res;
    const msg = {
      AFSIPMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFROHMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFFTKMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFNIPMIP: `I see an issue with your Internet connection, and I'm trying to fix it now.In the meantime, please reboot your Verizon router by unplugging the cable and plugging it back in. After that,
      you can just wait near your computer.`,
      AFBRMMIP: `I see an issue with your Internet connection, and I'm trying to fix it now. Please wait near your computer.`,
      AFFDKMIP: `I see an issue with your Internet connection, and I'm trying to fix it now. Please wait near your computer.`,
      AFSRMMIP: `I see an issue with your Video service, and I'm trying to fix it now. Please wait near your TV.`,
      AFFVKMIP: `I see an issue with your Video service, and I'm trying to fix it now. Please wait near your TV.`,
      AFORMMIP: `I see an issue with your FiOS service, and I'm trying to fix it now.`,
      AFUTTMIP: `I see an issue with your FiOS service, and I'm trying to fix it now.`,
      AFOOSMIP: `I see an issue with your FiOS service, and I'm trying to fix it now.`,
      default: `I found an issue while running a line test and I'm trying to fix it.`,
    };
    let defaultMsg = `I found an issue while running a line test and I'm trying to fix it.`;
    const msgBasedCode = msg[troubleCode] || defaultMsg;
    let smTempl = require('./schema/card/rebootRouter.json');
    let minTime, maxTime;
    if (timeout) {
      minTime = Math.floor(timeout / 60);
      maxTime = Math.ceil(timeout / 60);
    } else {
      minTime = 2;
      maxTime = 3;
    }
    // let msg = statusDesc ? statusDesc : `I found an issue while running a line test and I'm trying to fix it`
    const template = JSON.stringify(smTempl)
      .replace('$MessageCodeHere$', msgBasedCode)
      .replace('$min_time$', minTime)
      .replace('$max_time$', maxTime);

    return JSON.parse(template);
  }

  outageTmpl(type, res) {
    try {
      if (res && res.statusCode == '200') {
        if (res.template) {
          if (res.template.outageStatus == 'yes') {
            const { restorationTime, outageTicket } =
              res.template.hasLineOutage != null &&
              res.template.hasLineOutage == 'Y'
                ? res.template
                : res.template.response;
            let outageTmpl = require(`./schema/card/outage/outage.json`);
            const template = JSON.stringify(outageTmpl)
              .replace('$restorationTime$', restorationTime)
              .replace('$outageTicket$', outageTicket);
            return JSON.parse(template);
          } else {
            const fbDetect = this.ttMapper(type) || 'Outage';
            let smTempl = require(`./schema/card/outage/fallback/${fbDetect}.json`);
            return smTempl;
          }
        } else if (res.respFlags) {
          if (res.respFlags.outageStatus == 'yes') {
            const { restorationTime, outageTicket } =
              res.template.hasLineOutage != null &&
              res.template.hasLineOutage == 'Y'
                ? res.template
                : res.template.response;
            let outageTmpl = require(`./schema/card/outage/outage.json`);
            const template = JSON.stringify(outageTmpl)
              .replace('$restorationTime$', restorationTime)
              .replace('$outageTicket$', outageTicket);
            return JSON.parse(template);
          } else {
            const fbDetect = this.ttMapper(type) || 'Outage';
            let smTempl = require(`./schema/card/outage/fallback/${fbDetect}.json`);
            return smTempl;
          }
        } else {
          let resp = require('./schema/dfb.json');
          return resp;
        }
      } else if (res && res.statusCode == '406') {
        const fbDetect = this.ttMapper(type) || 'Outage';
        let smTempl = require(`./schema/card/outage/fallback/${fbDetect}.json`);
        return smTempl;
      } else {
        let resp = require('./schema/dfb.json');
        return resp;
      }
    } catch (e) {
      logger.error(e);
      let resp = require('./schema/dfb.json');
      return resp;
    }
  }

  ttMapper(code) {
    var mapList = {
      TSINTCONN: ['CCON', 'PCCR', 'WIFI', 'INTR'],
      NODIALTONE: ['NDT', 'MISC', 'CBC', 'CCO'],
      TSVOICE: ['TRAN'],
      cSetTopBox: ['STB', 'ACO', 'PIC', 'STB', 'DVR'],
    };
    const classifier = () => {
      for (var key of Object.keys(mapList)) {
        if (mapList[key].includes(code)) {
          return key;
        }
      }
    };

    const type = classifier();

    return type;
  }

  explainBillTmpl(res) {
    try {
      if (res.statusCode == '200') {
        let tmpl;
        const txt = res.template.text;
        let changeNotify = res.template.changeIndicator;
        if (!changeNotify && txt) {
          //Temp change when indicator is absent
          if (txt.includes('increased')) {
            changeNotify = 'U';
          } else if (txt.includes('decreased')) {
            changeNotify = 'D';
          }
        }
        if (changeNotify === 'U' || changeNotify === 'D') {
          tmpl = require(`./schema/card/billCompare/template.json`);
        } else {
          tmpl = require(`./schema/card/billCompare/nochange.json`);
        }
        const template = JSON.parse(
          JSON.stringify(tmpl).replace('$title$', txt)
        );
        const billText = res.template.impactItem
          .map((val) => val.itemDescription)
          .join('\n- ');
        template.botItems[2].molecule.text = `- ${billText}`;
        return template;
      } else {
        // Changes for the CXTDT-269826 other than agent connect
        let tmpl;
        logger.debug(
          '............Got different status code in from billCompare template block...........'
        );
        tmpl = require(`./schema/card/billCompare/template.json`);
        const template = JSON.parse(
          JSON.stringify(tmpl).replace('$title$', '')
        );
        template.botItems[0].molecule.text = '';
        return template;
      }
    } catch (e) {
      logger.error('An error occured in billCompare template block');
      let resp = require('./schema/dfb.json');
      return resp;
    }
  }

  outageRes(msgText, medium) {
    try {
      let sFixRes = null;
      const mapper = {
        AFFDKROK:
          'OK, please check your internet connection now. Is it working?',
        AFFTKROK: ' OK, please check your phone now. Is your line working?',
        AFFVKROK: ' OK, please check your TV now. Is it working?',
        AFNIPROK:
          ' OK, please check your internet connection now. Is it working?',
        AFOOSROK: ' OK, please check your FiOS services now. Are they working?',
        AFORMROK: ' OK, please check your FiOS services now. Are they working?',
        AFROHROK: ' OK, please check your phone now. Is your line working?',
        AFSIPROK: ' OK, please check your phone now. Is your line working?',
        AFSRMROK: ' OK, please check your TV now. Is it working?',
        AFUTTROK: ' OK, please check your FiOS services now. Are they working?',
      };

      var Sfresp = msgText.includes('_SMARTFIXFAILURE_') ? 'failed' : 'success';
      if (Sfresp === 'success') {
        let code = msgText.split('_SMARTFIXSUCCESS_')[1];
        const msg = mapper[code];
        sFixRes = msg
          ? this.textTemplateBuilder(msg)
          : this.textTemplateBuilder(
              'OK, please check your services now. Are they working?'
            );

        // Commenting based on the discussion in meeting (17-5-23)
        // sFixRes = msg ? this.textTemplateBuilder(msg) : (code == "TSOLTOOS" || code == "ALONTRIN" || code == "TSOLTORG" || code == "TSONTEOD" || code == "TSONTMOD") ? this.textTemplateBuilder("We have detected a connection issue to your ONT.") : this.textTemplateBuilder("OK, please check your services now. Are they working?");
        const followUp = {
          molecule: {
            moleculeName: 'scrollerWithButtons',
            buttons: [
              {
                style: 'secondary',
                action: {
                  displayMolecule: {
                    moleculeName: 'label',
                    text: "Yes, it's working",
                  },
                  actionType: 'botSearch',
                  extraParameters: {
                    searchTerm: "Yes, it's working",
                  },
                  pageType: 'search',
                  appContext: 'mobileFirstSS',
                },
                moleculeName: 'button',
                title: "Yes, it's working",
              },
              {
                style: 'secondary',
                action: {
                  displayMolecule: {
                    moleculeName: 'label',
                    text: 'No',
                  },
                  actionType: 'botSearch',
                  extraParameters: {
                    searchTerm: 'Not working',
                  },
                  pageType: 'search',
                  appContext: 'mobileFirstSS',
                },
                moleculeName: 'button',
                title: 'No',
              },
            ],
          },
          moleculeName: 'botItem',
        };
        const followUp3 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'Next',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Next_' + code,
            },
          },
          moleculeName: 'buttonCustom',
          title: 'Next',
        };
        const followUp4a = {
          moleculeName: 'label',
          text: 'Let’s try manually rebooting the ONT.',
        };
        const followUp4b = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'Continue',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Next_' + code,
            },
          },
          moleculeName: 'buttonCustom',
          title: 'Continue',
        };
        // if (code == "TSONTEOD" || code == "TSONTMOD") {
        //  sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp3);
        // } else if (code == "TSOLTOOS" || code == "ALONTRIN" || code == "TSOLTORG") {
        //  sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp4a);
        //  sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp4b);
        // }
        // else {
        //  sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp);
        // }
        // Commenting based on the discussion in meeting (17-5-23)

        sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp);
      } else {
        sFixRes = this.textTemplateBuilder(
          "Looks like I'm having a little trouble rebooting your device."
        );
        sFixRes.attachments[0].content.aemTemplate = require('./schema/card/rebootRouterFb.json');
      }
      if (medium === 'web') {
        return sFixRes;
      } else {
        return sFixRes.attachments[0].content.aemTemplate;
      }
    } catch (e) {
      logger.error('An error occured in outageRes template block', e);
      let resp = require('./schema/dfb.json');
      return resp;
    }
  }

  QRRestartRes(msgText, medium, trafficFlag, troubleType, oneAppReqCheck) {
    try {
      let sFixRes = null;
      const mapper = {
        AFFDKROK:
          'OK, please check your internet connection now. Is it working?',
        AFFTKROK: ' OK, please check your phone now. Is your line working?',
        AFFVKROK: ' OK, please check your TV now. Is it working?',
        AFNIPROK:
          ' OK, please check your internet connection now. Is it working?',
        AFOOSROK: ' OK, please check your FiOS services now. Are they working?',
        AFORMROK: ' OK, please check your FiOS services now. Are they working?',
        AFROHROK: ' OK, please check your phone now. Is your line working?',
        AFSIPROK: ' OK, please check your phone now. Is your line working?',
        AFSRMROK: ' OK, please check your TV now. Is it working?',
        AFUTTROK: ' OK, please check your FiOS services now. Are they working?',
      };

      var Sfresp = msgText.includes('_SMARTFIXQRSUCCESS_')
        ? 'success'
        : msgText.includes('_SMARTFIXQRTIMEOUT_')
        ? 'timeout'
        : 'failed';
      if (Sfresp === 'success') {
        let code = msgText.split('_SMARTFIXQRSUCCESS_')[1];
        const msg = mapper[code];
        //sFixRes =   msg ? this.textTemplateBuilder(msg) : this.textTemplateBuilder("Rebooting is now complete.");
        //Fix for VCGCV-1019
        sFixRes = this.textTemplateBuilder('Rebooting is now complete.');
        const tvMessage = 'Check your TV now. Is it fixed?';
        const routerMessage =
          code == 'TSOLTOOS' ||
          code == 'ALONTRIN' ||
          code == 'TSOLTORG' ||
          code == 'TSONTEOD' ||
          code == 'TSONTMOD'
            ? 'We have detected a connection issue to your ONT.'
            : 'Please check that your internet connection is now working.';
        const followUp1 = {
          moleculeName: 'botItem',
          molecule: {
            text:
              troubleType === 'STB' ||
              troubleType === 'PIC' ||
              troubleType === 'ACO'
                ? tvMessage
                : routerMessage,
            moleculeName: 'label',
          },
        };
        sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp1);
        let updateCode = code == 'AFFDKROK' ? `Next_${code}` : 'Not yet';
        const followUp = {
          molecule: {
            moleculeName: 'scrollerWithButtons',
            buttons: [
              {
                style: 'secondary',
                action: {
                  displayMolecule: {
                    moleculeName: 'label',
                    text: "Yes, it's working",
                  },
                  actionType: 'botSearch',
                  extraParameters: {
                    searchTerm: "Yes, it's working",
                  },
                  pageType: 'search',
                  appContext: 'mobileFirstSS',
                },
                moleculeName: 'button',
                title: "It's working",
              },
              {
                style: 'secondary',
                action: {
                  displayMolecule: {
                    moleculeName: 'label',
                    text: 'Not working',
                  },
                  actionType: 'botSearch',
                  extraParameters: {
                    searchTerm: updateCode,
                  },
                  pageType: 'search',
                  appContext: 'mobileFirstSS',
                },
                moleculeName: 'button',
                title: 'Not working',
              },
            ],
          },
          moleculeName: 'botItem',
        };
        const followUp3 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'Next',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Next_' + code,
            },
          },
          moleculeName: 'buttonCustom',
          title: 'Next',
        };
        const followUp4a = {
          moleculeName: 'label',
          text: 'Let’s try manually rebooting the ONT.',
        };
        const followUp4b = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'Continue',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'Next_' + code,
            },
          },
          moleculeName: 'buttonCustom',
          title: 'Continue',
        };
        if (code == 'TSONTEOD' || code == 'TSONTMOD') {
          sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp3);
        } else if (
          code == 'TSOLTOOS' ||
          code == 'ALONTRIN' ||
          code == 'TSOLTORG'
        ) {
          sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp4a);
          sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp4b);
        } else {
          sFixRes.attachments[0].content.aemTemplate.botItems.push(followUp);
        }
        return sFixRes;
      } else if (!oneAppReqCheck && trafficFlag && medium === 'Mobile') {
        sFixRes = this.textTemplateBuilder(
          "Okay. There's more we can try. Let's use a visual aid to check your router."
        );
        sFixRes.attachments[0].content.aemTemplate = require('./schema/card/techseeEntry.json');
        if (
          troubleType === 'STB' ||
          troubleType === 'PIC' ||
          troubleType === 'ACO'
        ) {
          sFixRes.attachments[0].content.aemTemplate = require('./schema/card/tvTechseeEntry.json');
        }
        return sFixRes;
      } else {
        sFixRes = this.textTemplateBuilder(
          "This step usually works, but I'll need to connect you to a live agent for additional assistance."
        );
        sFixRes.attachments[0].content.aemTemplate = require('./schema/card/rebootQRFailWeb.json');
        return sFixRes;
      }
    } catch (e) {
      logger.error('An error occured in QR restart template block', e);
      let resp = require('./schema/dfb.json');
      return resp;
    }
  }

  STBSuccessErrorTemplate(msgText) {
    try {
      logger.debug(
        'STB Activate Success Error Template function:::::::::::::' + msgText
      );
      let stbRes = null;
      let checkText =
        msgText.includes('_STBACTIVETIMEOUT_') ||
        msgText.includes('_STBACTIVEFAILURE_')
          ? 'Failure'
          : 'Success';
      if (checkText == 'Success') {
        stbRes = this.textTemplateBuilder(
          'Alright, activation should be completed.'
        );
        const text1 = {
          moleculeName: 'botItem',
          molecule: {
            text: 'Please check to make sure your equipment is activated and working properly.',
            moleculeName: 'label',
          },
        };
        stbRes.attachments[0].content.aemTemplate.botItems.push(text1);
        const button1 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'There is an error code',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'yes',
            },
          },
          moleculeName: 'buttonCustom',
          title: 'There is an error code',
        };
        stbRes.attachments[0].content.aemTemplate.botItems.push(button1);
        const button2 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'No errors showing',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'no',
            },
          },
          moleculeName: 'buttonCustom',
          title: 'No errors showing',
        };
        stbRes.attachments[0].content.aemTemplate.botItems.push(button2);
      } else {
        stbRes = this.textTemplateBuilder(
          'Since I’m having trouble activating your equipment, Can I connect you to an agent who can help you further ?'
        );
        const button1 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'Connect to an agent',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'chat with an agent',
            },
          },
          moleculeName: 'buttonCustom',
          title: 'Connect to an agent',
        };
        stbRes.attachments[0].content.aemTemplate.botItems.push(button1);
        const button2 = {
          style: 'secondary',
          action: {
            actionType: 'botSearch',
            appContext: 'mobileFirstSS',
            displayMolecule: {
              text: 'No, Thanks',
              moleculeName: 'label',
            },
            pageType: 'search',
            extraParameters: {
              searchTerm: 'No, thanks',
            },
          },
          moleculeName: 'buttonCustom',
          title: 'No, Thanks',
        };
        stbRes.attachments[0].content.aemTemplate.botItems.push(button2);
      }
      return stbRes;
    } catch (e) {
      logger.error('An error occured in STB activate template block', e);
      let resp = require('./schema/dfb.json');
      return resp;
    }
  }

  QRSmartFixTmplBuilder(res, troubleType) {
    //ToDO: add fallback scenarion when statuscode not 200
    const {
      statusDesc,
      apipollingflag,
      transactionID,
      troubleCode,
      statusCode,
      timeout,
    } = res;
    const msg = {
      AFSIPMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFROHMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFFTKMIP: `I see an issue with your dial tone, and I'm trying to fix it now. Please wait near your phone.`,
      AFNIPMIP: `I found an issue with your Internet connection, and I'm trying to fix it now.In the meantime, please reboot your Verizon router by unplugging the cable and plugging it back in. After that,
      you can just wait near your computer.`,
      AFBRMMIP: `I found an issue with your Internet connection, and I'm trying to fix it now. Please wait near your computer.`,
      AFFDKMIP: `I found an issue with your Internet connection, and I'm trying to fix it now. Please wait near your computer.`,
      AFSRMMIP: `I found an issue with your Video service, and I'm trying to fix it now. Please wait near your TV.`,
      AFFVKMIP: `I found an issue with your Video service, and I'm trying to fix it now. Please wait near your TV.`,
      AFORMMIP: `I found an issue with your FiOS service, and I'm trying to fix it now.`,
      AFUTTMIP: `I found an issue with your FiOS service, and I'm trying to fix it now.`,
      AFOOSMIP: `I found an issue with your FiOS service, and I'm trying to fix it now.`,
      default: `I found an issue while running a line test and I'm trying to fix it.`,
    };
    let defaultMsg = `I found an issue with your internet connection, and I'm trying to fix it now.`;
    const msgBasedCode = msg[troubleCode] || defaultMsg;

    let vmsTemp = require('./schema/card/vmsReboot.json');
    let smTempl = require('./schema/card/QuantumRebootRouter.json');
    let minTime, maxTime;
    if (timeout) {
      minTime = Math.floor(timeout / 60);
      maxTime = Math.ceil(timeout / 60);
    } else {
      minTime = 2;
      maxTime = 5;
    }
    // let msg = statusDesc ? statusDesc : `I found an issue while running a line test and I'm trying to fix it`
    //Below fix as part of VCGCV-1019
    maxTime = 5;
    var template;
    if (
      troubleType === 'STB' ||
      troubleType === 'PIC' ||
      troubleType === 'ACO'
    ) {
      template = JSON.stringify(vmsTemp).replace('$max_time$', maxTime);
    } else {
      template = JSON.stringify(smTempl)
        .replace('$MessageCodeHere$', msgBasedCode)
        .replace('$max_time$', maxTime);
    }

    return JSON.parse(template);
  }

  STBActivationTmplBuilder(res, troubleType) {
    let smTempl = require('./schema/card/stbActivation/stbActivationProgress.json');
    let maxTime = 5;
    var template;
    template = JSON.stringify(smTempl).replace('$max_time$', maxTime);

    return JSON.parse(template);
  }
}

module.exports.TemplateBuilder = TemplateBuilder;
