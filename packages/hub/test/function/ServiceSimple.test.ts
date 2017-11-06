import {Facade} from '../../src/Facade';
import {Hub} from '../../src/hub/Hub';
import {expect} from 'chai';

describe('ServiceSimple', function () {

  class TestHub extends Hub {
    getRouteTable () {
      return this.routeTable;
    }
  }

  let facade: Facade;
  let hub: TestHub;


  before(async () => {
    hub = new TestHub;
    facade = new Facade;
    facade.setup({
      location: {
        appName: 'test'
      }
    });
    await hub.start();
    await facade.start();
  });

  after(async () => {
    await facade.stop();
    await hub.stop();
  });


  it('should publish service be ok', async () => {
    await facade.publish(Math, {
      name: 'math',
      tag: 'latest'
    });
    const selectedClients = hub.getRouteTable().selectClients({
      serviceName: 'math',
      tag: 'latest'
    });
    expect(selectedClients.length).to.be.equal(1);
  });

  it('should invoke through consumer be ok', async () => {
    const consumer = facade.getConsumer({name: 'math', tag: 'latest'});
    const introspection = await consumer.introspect();
    expect(introspection.methods.length).to.be.gt(0);
    expect(introspection.properties.length).to.be.gt(0);
    const val = await consumer.invoke('abs', [-1234]);
    expect(val).to.be.equal(1234);
  });

  it('should invoke through proxy be ok', async () => {
    const proxy: Math = await facade.getProxy<Math>({name: 'math', tag: 'latest'});
    const val = await proxy.abs(-1234);
    expect(val).to.be.equal(1234);
  });

});